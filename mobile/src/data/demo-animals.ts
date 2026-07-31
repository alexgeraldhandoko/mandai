import type { ImageSourcePropType } from 'react-native';

import type { Language, ResponseLength } from '@/context/settings-context';

export type DemoQuestionId = 'identify' | 'behaviour' | 'conservation';

export type DemoAnimal = {
  id: string;
  name: string;
  nameId: string;
  shortName: string;
  image: ImageSourcePropType;
  assetUri: string;
  alt: string;
  visual: string;
  visualId: string;
  behaviour: string;
  behaviourId: string;
  status: string;
  statusId: string;
  fact: string;
  factId: string;
};

export const demoAnimals: DemoAnimal[] = [
  {
    id: 'asian-elephant',
    name: 'an Asian elephant',
    nameId: 'seekor gajah Asia',
    shortName: 'Elephant',
    image: require('../../assets/demo/asian-elephant.png'),
    assetUri: 'demo://asian-elephant',
    alt: 'Bundled demo photo of an Asian elephant beside a pool',
    visual: 'standing ahead beside a shallow pool and lifting grass with its trunk',
    visualId: 'berdiri di depan dekat kolam dangkal sambil mengangkat rumput dengan belalainya',
    behaviour: 'It is using its trunk to gather food, a normal feeding behaviour.',
    behaviourId: 'Gajah itu memakai belalainya untuk mengambil makanan, perilaku makan yang normal.',
    status: 'Endangered',
    statusId: 'Terancam Punah',
    fact: 'Mud and dust can help protect elephant skin from sun and insects.',
    factId: 'Lumpur dan debu dapat membantu melindungi kulit gajah dari matahari dan serangga.',
  },
  {
    id: 'malayan-tiger',
    name: 'a Malayan tiger',
    nameId: 'seekor harimau Malaya',
    shortName: 'Tiger',
    image: require('../../assets/demo/malayan-tiger.png'),
    assetUri: 'demo://malayan-tiger',
    alt: 'Bundled demo photo of a Malayan tiger near a forest stream',
    visual: 'standing ahead near a shallow stream and looking toward the camera',
    visualId: 'berdiri di depan dekat aliran air dangkal dan melihat ke arah kamera',
    behaviour: 'It is standing alert, which may happen while a tiger watches its surroundings.',
    behaviourId: 'Harimau itu berdiri waspada, yang dapat terjadi saat mengamati sekitarnya.',
    status: 'Critically Endangered',
    statusId: 'Kritis',
    fact: 'Every tiger has a unique stripe pattern.',
    factId: 'Setiap harimau memiliki pola belang yang unik.',
  },
  {
    id: 'orangutan',
    name: 'an orangutan',
    nameId: 'seekor orangutan',
    shortName: 'Orangutan',
    image: require('../../assets/demo/orangutan.png'),
    assetUri: 'demo://orangutan',
    alt: 'Bundled demo photo of an orangutan sitting on a branch',
    visual: 'sitting ahead on a high branch while holding a vine',
    visualId: 'duduk di depan pada cabang tinggi sambil memegang sulur',
    behaviour: 'It is resting above the ground, where orangutans spend much of their time.',
    behaviourId: 'Orangutan itu beristirahat di atas tanah, tempat mereka menghabiskan banyak waktu.',
    status: 'Critically Endangered',
    statusId: 'Kritis',
    fact: 'The name orangutan comes from Malay words meaning person of the forest.',
    factId: 'Nama orangutan berasal dari bahasa Melayu yang berarti orang dari hutan.',
  },
  {
    id: 'penguin',
    name: 'a group of African penguins',
    nameId: 'sekelompok penguin Afrika',
    shortName: 'Penguins',
    image: require('../../assets/demo/penguin.png'),
    assetUri: 'demo://penguin',
    alt: 'Bundled demo photo of African penguins beside a pool',
    visual: 'standing ahead beside a pool, with one penguin in the foreground looking left',
    visualId: 'berdiri di depan dekat kolam, dengan satu penguin di bagian depan melihat ke kiri',
    behaviour: 'They are standing and socialising on land beside the water.',
    behaviourId: 'Mereka berdiri dan bersosialisasi di darat dekat air.',
    status: 'Critically Endangered',
    statusId: 'Kritis',
    fact: 'African penguins live on southern African coasts, not in Antarctica.',
    factId: 'Penguin Afrika hidup di pesisir Afrika bagian selatan, bukan di Antarktika.',
  },
  {
    id: 'giraffe',
    name: 'a giraffe',
    nameId: 'seekor jerapah',
    shortName: 'Giraffe',
    image: require('../../assets/demo/giraffe.png'),
    assetUri: 'demo://giraffe',
    alt: 'Bundled demo photo of a giraffe browsing leaves from a tree',
    visual: 'standing ahead and reaching into a tree to browse leaves',
    visualId: 'berdiri di depan dan menjangkau daun di pohon',
    behaviour: 'It is browsing leaves, using its height and long tongue to reach food.',
    behaviourId: 'Jerapah itu memakan daun dengan memanfaatkan tinggi tubuh dan lidah panjangnya.',
    status: 'Vulnerable',
    statusId: 'Rentan',
    fact: 'A giraffe’s patch pattern is unique to the individual.',
    factId: 'Pola bercak setiap jerapah berbeda dan unik.',
  },
];

export const demoQuestions: {
  id: DemoQuestionId;
  label: string;
  labelId: string;
}[] = [
  { id: 'identify', label: 'What am I looking at?', labelId: 'Apa yang sedang saya lihat?' },
  { id: 'behaviour', label: 'What is it doing?', labelId: 'Apa yang sedang dilakukannya?' },
  {
    id: 'conservation',
    label: 'Tell me a conservation fact.',
    labelId: 'Ceritakan fakta konservasi.',
  },
];

export function getDemoAnswer(
  animal: DemoAnimal,
  question: DemoQuestionId,
  language: Language,
  responseLength: ResponseLength,
): string {
  const indonesian = language === 'id-ID';
  if (question === 'behaviour') {
    return indonesian
      ? `${animal.nameId[0].toUpperCase()}${animal.nameId.slice(1)} sedang ${animal.visualId}. ${animal.behaviourId}`
      : `${animal.name[0].toUpperCase()}${animal.name.slice(1)} is ${animal.visual}. ${animal.behaviour}`;
  }
  if (question === 'conservation') {
    return indonesian
      ? `${animal.nameId[0].toUpperCase()}${animal.nameId.slice(1)} berstatus ${animal.statusId}. ${animal.factId}`
      : `${animal.name[0].toUpperCase()}${animal.name.slice(1)} is listed as ${animal.status}. ${animal.fact}`;
  }

  const base = indonesian
    ? `Anda sedang melihat ${animal.nameId} yang ${animal.visualId}.`
    : `You are looking at ${animal.name} ${animal.visual}.`;
  if (responseLength === 'brief') return base;
  return indonesian ? `${base} ${animal.behaviourId}` : `${base} ${animal.behaviour}`;
}

