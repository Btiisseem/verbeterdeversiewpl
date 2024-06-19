import express from "express";
import { getAllCards, getPageCard, register, searchCards } from "../public/db/database";
import { Card } from "../public/interfaces/mgtcards";
import { secureMiddleware } from "../public/middleware/secureMiddleware";


export function mainRouter(){
    const router = express.Router();
    const cardperpage = 12

    router.get("/main", secureMiddleware,async (req, res) => {
        const searchedCards: string = typeof req.query.searchedCards === "string" ? req.query.searchedCards : "";
        let cards: Card[] = [];
        const page = parseInt(req.query.p as string) || 1;
        let totalPages: number = 0;
        // checken als iets word gezocht ! 
        if (searchedCards !== "") {
          const filteredCards = await searchCards(searchedCards);
          totalPages = Math.ceil(filteredCards.length / cardperpage)
          cards = filteredCards.slice((page - 1) * cardperpage, page * cardperpage);
        }
        else {
          cards = await getPageCard(page, cardperpage);
          const totalCards: number = (await getAllCards()).length;
          totalPages = Math.ceil(totalCards / cardperpage);
        }
      
        res.render("main", {
          activePage: 'home',
          cards: cards,
          currentPage: page,
          totalPages: totalPages,
          searchedCards: searchedCards, 
          getRarityClass: getRarityClass
        })
      })
      
      router.get('/next', async (req, res) => {
        const page = parseInt(req.query.p as string) || 1;
        const nextPage = page + 1;
        const totalCards = (await getAllCards()).length;
        const cards = await getPageCard(nextPage, cardperpage);
        const totalPages = Math.ceil(totalCards / cardperpage);
        res.render('main', {
          cards,
          currentPage: nextPage,
          totalPages: totalPages,
        });
      });
      
      
        function getRarityClass(rarity: string): string {
            switch (rarity.toLowerCase()) {
            case 'common':
                return 'common-border';
            case 'uncommon':
                return 'uncommon-border';
            case 'rare':
                return 'rare-border';
            case 'mythic rare':
                return 'mythic-border';
            default:
                return '';
            }
        }
        
      
    return router;
}