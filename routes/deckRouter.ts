import express from "express";
import { secureMiddleware } from "../public/middleware/secureMiddleware";
import { addCardToDeck, createDeck, decksCollection, deleteDeck, findCardByName, findDeckById, getDecks, updateDeck } from "../public/db/database";
import { ObjectId } from "mongodb";
import { Card } from "../public/interfaces/mgtcards";

export function deckRouter() {
    const router = express.Router();

    router.get('/decklist', secureMiddleware, async (req, res) => {
        try {
            const userId = new ObjectId(req.session.user?._id);
            const decks = await getDecks(userId);
            res.render('decklist', { activePage: 'decklist', decks });
        } catch (error) {
            console.error('Error retrieving decks:', error);
            res.render('error', { message: 'Error retrieving decks' });
        }
    });

    router.post('/decklist', secureMiddleware, async (req, res) => {
        try {
            const deckData = req.body;
            const userId = new ObjectId(req.session.user?._id);

            const existingDeck = await decksCollection.findOne({ name: deckData.name, userId });
            if (existingDeck) {
                throw new Error('Deck naam is al bezet, kies een andere');
            }

            await createDeck(deckData, userId);
            res.redirect('/decklist');
        } catch (error) {
            console.error('Error creating deck:', error);
            res.render('error', { message: error });
        }
    });

    router.post('/deckdetail/add-card', secureMiddleware, async (req, res) => {
        try {
            const { deckId, cardId, quantity } = req.body;
            const card: Card | null = await findCardByName(cardId);
            if (!card) throw new Error('Card not found');
            await addCardToDeck(new ObjectId(deckId), cardId, card, parseInt(quantity));
            res.redirect(`/deckdetail?id=${deckId}`);
        } catch (error) {
            console.error('Error adding card to deck:', error);
            res.render('error', { message: error });
        }
    });

    router.post('/deckdetail/update', secureMiddleware, async (req, res) => {
        try {
            const { deckId, name, imageUrl } = req.body;
            const deckUpdate = { name, imageUrl };
            await updateDeck(new ObjectId(deckId), deckUpdate);
            res.redirect(`/deckdetail?id=${deckId}`);
        } catch (error) {
            console.error('Error updating deck:', error);
            res.render('error', { message: 'Error updating deck' });
        }
    });

    router.post('/deckdetail/delete', secureMiddleware, async (req, res) => {
        try {
            const { deckId } = req.body;
            await deleteDeck(new ObjectId(deckId));
            res.redirect('/decklist');
        } catch (error) {
            console.error('Error deleting deck:', error);
            res.render('error', { message: 'Error deleting deck' });
        }
    });

    router.post('/deckdetail/update-card', secureMiddleware, async (req, res) => {
        try {
            const { deckId, cardId, change } = req.body;
            const deck = await findDeckById(new ObjectId(deckId));
            if (!deck) throw new Error('Deck not found');
            const cardEntry = deck.cards[cardId];
            if (!cardEntry) throw new Error('Card not found in deck');

            const newQuantity = cardEntry.quantity + parseInt(change);
            if (newQuantity > 4) throw new Error('Cannot have more than 4 of the same card in a deck');
            if (newQuantity < 1) throw new Error('Quantity cannot be less than 1');

            cardEntry.quantity = newQuantity;
            deck.cards[cardId] = cardEntry;
            deck.totalCards = Object.values(deck.cards).reduce((total, { quantity }) => total + quantity, 0);

            await decksCollection.updateOne({ _id: new ObjectId(deckId) }, { $set: { cards: deck.cards, totalCards: deck.totalCards } });
            res.redirect(`/deckdetail?id=${deckId}`);
        } catch (error) {
            console.error('Error updating card quantity in deck:', error);
            res.render('error', { message: 'Error updating card quantity in deck' });
        }
    });

    router.post('/deckdetail/delete-card', secureMiddleware, async (req, res) => {
        try {
            const { deckId, cardId } = req.body;
            const deck = await findDeckById(new ObjectId(deckId));
            if (!deck) throw new Error('Deck not found');
            if (!deck.cards[cardId]) throw new Error('Card not found in deck');

            delete deck.cards[cardId];
            deck.totalCards = Object.values(deck.cards).reduce((total, { quantity }) => total + quantity, 0);

            await decksCollection.updateOne({ _id: new ObjectId(deckId) }, { $set: { cards: deck.cards, totalCards: deck.totalCards } });
            res.redirect(`/deckdetail?id=${deckId}`);
        } catch (error) {
            console.error('Error deleting card from deck:', error);
            res.render('error', { message: 'Error deleting card from deck' });
        }
    });

    router.get('/deckdetail', secureMiddleware, async (req, res) => {
        const deckId = new ObjectId(req.query.id as string);
        const page = parseInt(req.query.p as string) || 1;
        const cardsPerPage = 10;
        const deck = await findDeckById(deckId);

        if (deck) {
            const totalCards = Object.values(deck.cards).reduce((acc, { quantity }) => acc + quantity, 0);
            const totalPages = Math.ceil(totalCards / cardsPerPage);
            const start = (page - 1) * cardsPerPage;
            const end = start + cardsPerPage;
            const cards = Object.entries(deck.cards).slice(start, end).map(([cardId, cardData]) => ({ card: cardData.card, quantity: cardData.quantity }));

            res.render("deckdetail", {
                activePage: 'deckdetail',
                deck: deck,
                cards: cards,
                currentPage: page,
                totalPages: totalPages
            });
        } else {
            res.render("404");
        }
    });

    return router;
}
