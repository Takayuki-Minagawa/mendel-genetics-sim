import type { Preset, Gene } from '../types/genetics';

export const peaSeedColorGene: Gene = {
  id: 'seedColor',
  locus: 'Y',
  trait: 'seedColor',
  name: { ja: '種子の色', en: 'Seed color' },
  inheritance: 'complete',
  alleles: [{ symbol: 'Y' }, { symbol: 'y' }],
  phenotypeMap: {
    YY: 'yellow',
    Yy: 'yellow',
    yy: 'green',
  },
  phenotypes: {
    yellow: { id: 'yellow', name: { ja: '黄色', en: 'Yellow' }, color: '#F5B700' },
    green: { id: 'green', name: { ja: '緑色', en: 'Green' }, color: '#5DAE3B' },
  },
};

export const peaSeedShapeGene: Gene = {
  id: 'seedShape',
  locus: 'R',
  trait: 'seedShape',
  name: { ja: '種子の形', en: 'Seed shape' },
  inheritance: 'complete',
  alleles: [{ symbol: 'R' }, { symbol: 'r' }],
  phenotypeMap: {
    RR: 'round',
    Rr: 'round',
    rr: 'wrinkled',
  },
  phenotypes: {
    round: { id: 'round', name: { ja: '丸', en: 'Round' }, color: '#8B5CF6' },
    wrinkled: { id: 'wrinkled', name: { ja: 'しわ', en: 'Wrinkled' }, color: '#EC4899' },
  },
};

export const flowerColorGene: Gene = {
  id: 'flowerColor',
  locus: 'R',
  trait: 'flowerColor',
  name: { ja: '花の色', en: 'Flower color' },
  inheritance: 'incomplete',
  alleles: [{ symbol: 'R' }, { symbol: 'r' }],
  phenotypeMap: {
    RR: 'red',
    Rr: 'pink',
    rr: 'white',
  },
  phenotypes: {
    red: { id: 'red', name: { ja: '赤', en: 'Red' }, color: '#E11D48' },
    pink: { id: 'pink', name: { ja: '桃色', en: 'Pink' }, color: '#F472B6' },
    white: { id: 'white', name: { ja: '白', en: 'White' }, color: '#E5E7EB' },
  },
};

export const bloodTypeGene: Gene = {
  id: 'bloodType',
  locus: 'ABO',
  trait: 'bloodType',
  name: { ja: 'ABO式血液型', en: 'ABO blood type' },
  inheritance: 'codominant',
  alleles: [{ symbol: 'A' }, { symbol: 'B' }, { symbol: 'O' }],
  phenotypeMap: {
    AA: 'A',
    AO: 'A',
    AB: 'AB',
    BB: 'B',
    BO: 'B',
    OO: 'O',
  },
  phenotypes: {
    A: { id: 'A', name: { ja: 'A型', en: 'Type A' }, color: '#EF4444' },
    B: { id: 'B', name: { ja: 'B型', en: 'Type B' }, color: '#3B82F6' },
    AB: { id: 'AB', name: { ja: 'AB型', en: 'Type AB' }, color: '#8B5CF6' },
    O: { id: 'O', name: { ja: 'O型', en: 'Type O' }, color: '#6B7280' },
  },
};

export const mouseFurGene: Gene = {
  id: 'furColor',
  locus: 'Y',
  trait: 'furColor',
  name: { ja: '毛の色', en: 'Fur color' },
  inheritance: 'lethal',
  alleles: [{ symbol: 'Y' }, { symbol: 'y' }],
  phenotypeMap: {
    YY: 'lethal',
    Yy: 'yellowFur',
    yy: 'grayFur',
  },
  phenotypes: {
    yellowFur: { id: 'yellowFur', name: { ja: '黄色', en: 'Yellow' }, color: '#E8B23A' },
    grayFur: { id: 'grayFur', name: { ja: '灰色', en: 'Gray' }, color: '#8D8172' },
    lethal: { id: 'lethal', name: { ja: '致死', en: 'Lethal' }, color: '#374151', lethal: true },
  },
};

export const presets: Preset[] = [
  {
    id: 'peaSeedColor',
    icon: '🟡',
    name: { ja: 'エンドウの種子の色', en: 'Pea seed color' },
    description: {
      ja: '黄色(Y)が顕性、緑色(y)が潜性。メンデルが最初に調べた形質の一つです。',
      en: 'Yellow (Y) is dominant over green (y) — one of the first traits Mendel studied.',
    },
    genes: [peaSeedColorGene],
    parent1: [['Y', 'y']],
    parent2: [['Y', 'y']],
    mendelData: { yellow: 6022, green: 2001 },
  },
  {
    id: 'peaSeedShape',
    icon: '🫛',
    name: { ja: 'エンドウの種子の形', en: 'Pea seed shape' },
    description: {
      ja: '丸(R)が顕性、しわ(r)が潜性。しわ型はデンプンを作る酵素の遺伝子が壊れています。',
      en: 'Round (R) is dominant over wrinkled (r). Wrinkled seeds carry a broken starch enzyme gene.',
    },
    genes: [peaSeedShapeGene],
    parent1: [['R', 'r']],
    parent2: [['R', 'r']],
    mendelData: { round: 5474, wrinkled: 1850 },
  },
  {
    id: 'flowerColor',
    icon: '🌺',
    name: { ja: 'マルバアサガオの花色', en: 'Flower color' },
    description: {
      ja: '不完全顕性：ヘテロ接合(Rr)は赤と白の中間の桃色になります。',
      en: 'Incomplete dominance: heterozygotes (Rr) are pink — in between red and white.',
    },
    genes: [flowerColorGene],
    parent1: [['R', 'r']],
    parent2: [['R', 'r']],
  },
  {
    id: 'bloodType',
    icon: '🩸',
    name: { ja: 'ABO式血液型', en: 'ABO blood type' },
    description: {
      ja: '3つの対立遺伝子(複対立遺伝子)。AとBは共顕性、Oは潜性です。',
      en: 'Three alleles (multiple alleles). A and B are codominant; O is recessive.',
    },
    genes: [bloodTypeGene],
    parent1: [['A', 'O']],
    parent2: [['B', 'O']],
  },
  {
    id: 'lethal',
    icon: '🐭',
    name: { ja: 'ネズミの毛色（致死遺伝子）', en: 'Mouse fur (lethal gene)' },
    description: {
      ja: 'Yは毛色では顕性だが、YYになると胎児のうちに死んでしまう(致死)。生まれる子の比は2:1に！',
      en: 'Y is dominant for fur color, but YY embryos die. Surviving offspring show a 2:1 ratio!',
    },
    genes: [mouseFurGene],
    parent1: [['Y', 'y']],
    parent2: [['Y', 'y']],
  },
  {
    id: 'dihybrid',
    icon: '🧩',
    name: { ja: '2遺伝子雑種（色×形）', en: 'Dihybrid (color × shape)' },
    description: {
      ja: '色と形の遺伝子は独立に分配されるため、F2は 9:3:3:1 に分かれます。',
      en: 'Color and shape genes assort independently, giving a 9:3:3:1 ratio in F2.',
    },
    genes: [peaSeedColorGene, peaSeedShapeGene],
    parent1: [['Y', 'y'], ['R', 'r']],
    parent2: [['Y', 'y'], ['R', 'r']],
    mendelData: {
      'yellow|round': 315,
      'yellow|wrinkled': 101,
      'green|round': 108,
      'green|wrinkled': 32,
    },
  },
];

export default presets;
