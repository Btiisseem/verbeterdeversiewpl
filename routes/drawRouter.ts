import express from "express";
import { secureMiddleware } from "../public/middleware/secureMiddleware";
import { ObjectId } from "mongodb";
import { copyDeckForUser, copyDecksCollection, drawCardFromCopiedDeck, findDeckById, getDecks, shuffleDeck } from "../public/db/database";


export function drawRouter(){
  const router = express.Router();

  router.get('/overview', secureMiddleware, async (req, res) => {
      const userId = new ObjectId(req.session.user?._id);
      const decks = await getDecks(userId);
      res.render('overview', {
          activePage: 'draw',
          decks
      });
  });

  router.post('/shuffle', secureMiddleware, async (req, res) => {
      const { deckId } = req.body;
      await shuffleDeck(new ObjectId(deckId));
      res.redirect('/overview');
  });

  router.post('/draw', secureMiddleware, async (req, res) => {
      const { deckId } = req.body;
      const result = await drawCardFromCopiedDeck(new ObjectId(deckId));
      if (!result) {
          res.json({ error: 'De decks zijn leeg, alle kaarten werden uitgehaald.' });
      } else {
          res.json(result);
      }
  });
  router.post('/copy-deck', secureMiddleware, async (req, res) => {
    const userId = new ObjectId(req.session.user?._id);
    const { deckId } = req.body;
    const copiedDeck = await copyDeckForUser(new ObjectId(deckId), userId);
    res.json(copiedDeck);
});
router.post('/reset', secureMiddleware, async (req, res) => {
    const { deckId } = req.body;
    const userId = new ObjectId(req.session.user?._id);

    try {
      const originalDeck = await findDeckById(new ObjectId(deckId));
      if (!originalDeck) {
        return res.json({ error: 'Deck not found' });
      }

      const copiedDeck = await copyDeckForUser(new ObjectId(deckId), userId);

      await copyDecksCollection.updateOne(
        { _id: new ObjectId(deckId) },
        { $set: { cards: copiedDeck.cards, totalCards: copiedDeck.totalCards } }
      );

      res.json({
        remainingCards: copiedDeck.totalCards,
        totalCards: copiedDeck.totalCards
      });
    } catch (error) {
      res.json({ error: 'Failed to reset the deck. Please try again.' });
    }
  });
  
  return router;

}