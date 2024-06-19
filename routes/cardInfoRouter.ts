import express from "express";
import { User } from "../public/interfaces/user";
import { findCardByName, addCardToDeck, getDecks } from "../public/db/database";
import { secureMiddleware } from "../public/middleware/secureMiddleware";
import { ObjectId } from "mongodb";

export function cardInfoRouter() {
  const router = express.Router();
  router.get("/cardinfo", secureMiddleware, async (req, res) => {
    const cardName = req.query.name as string;
    const pagelocated = parseInt(req.query.p as string);
    const searchedCards: string = typeof req.query.searchedCards === "string" ? req.query.searchedCards : "";
    const card = await findCardByName(cardName);
    const userId = new ObjectId(req.session.user?._id);
    const decks = await getDecks(userId);

    if (card) {
      res.render("cardinfo", {
        activePage: 'cardinfo',
        card: card,
        p: pagelocated,
        searchedCards: searchedCards,
        decks: decks.map(deck => ({
          ...deck,
          cardCount: deck.cards[card.name] ? deck.cards[card.name].quantity : 0
        }))
      });
    } else {
      res.render("404");
    }
  });

  router.post("/cardinfo/add-to-deck", secureMiddleware, async (req, res) => {
    try {
      const { cardName, deckId } = req.body;
      const card = await findCardByName(cardName);
      if (!card) throw new Error('Card not found');

      await addCardToDeck(new ObjectId(deckId), card.name, card, 1);
      res.redirect(`/cardinfo?name=${cardName}`);
    } catch (error) {
      console.error('Error adding card to deck:', error);
      res.render('error', { message: 'Error adding card to deck' });
    }
  });

  return router;
}
