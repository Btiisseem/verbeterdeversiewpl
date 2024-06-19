export interface Card {
    name: string;
    names: string[];
    cmc: number;
    colors: string[];
    type: string;
    rarity: string;
    text: string;
    artist: string;
    number: string;
    power: string;
    toughness: string;
    imageUrl: string;
    rarityColor: string;
  }
  

export interface CardsResponse {
    cards: Card[];
  }