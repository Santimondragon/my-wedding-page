import { Beef, BottleWine, Drumstick, Ham, Milk, Wine, WineOff } from 'lucide-react';

const dishes = {
  1: {
    dish: 'Bondiola',
    icon: Beef,
    description:
      'Bondiola con salsa de pimientos acompañada de cremoso de platano maduro crocante de quinua y tinta de calamar.',
  },
  2: {
    dish: 'Cochinita Pibil',
    icon: Ham,
    description: 'Cochinita Pibil a la parrilla con arroz cremoso.',
  },
  3: {
    dish: 'Pollo',
    icon: Drumstick,
    description:
      'Pollo en salsa de vino, pasta orzo de quesos, tomates cherry rostizados y brotes de temporada.',
  },
};

const drinks = {
  1: {
    drink: 'Aguardiente',
    icon: Milk,
  },
  2: {
    drink: 'Whisky',
    icon: BottleWine,
  },
  3: {
    drink: 'Baileys',
    icon: Wine,
  },
  4: {
    drink: 'No Alcohol',
    icon: WineOff,
  },
};

const kidsDishes = {
  1: {
    dish: 'Nuggets',
    description: 'Nuggets con papitas.',
  },
  2: {
    dish: 'Hamburguesa',
    description: 'Hamburguesa con papitas',
  },
  3: {
    dish: 'Pasta',
    description:
      'Pasta con pollo. Opción de pasta corta o larga con alguna salsa especial (Dejanos saber que quieres)',
  },
};

export { dishes, kidsDishes, drinks };
