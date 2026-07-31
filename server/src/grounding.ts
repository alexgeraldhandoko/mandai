import animals from '../../data/mandaiAnimals.json' with { type: 'json' };

export type MandaiAnimal = (typeof animals)[number];

export function getGroundingText(): string {
  return JSON.stringify(animals, null, 2);
}

export function getAnimals(): MandaiAnimal[] {
  return animals;
}

