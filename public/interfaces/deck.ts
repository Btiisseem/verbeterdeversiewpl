import { ObjectId } from "mongodb";
import { Card } from "./mgtcards";

export interface Deck {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  cards: {
    [cardId: string]: {
      card: Card;
      quantity: number;
    };
  };
  totalCards: number; 
  imageUrl: string;
}
