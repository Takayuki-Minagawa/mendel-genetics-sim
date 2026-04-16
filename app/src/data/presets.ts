import type { Preset, Gene } from '../types/genetics';

const peaSeedColorGene: Gene = {
  name: 'seedColor',
  locus: 'Y',
  alleles: [
    { symbol: 'Y', dominant: true, displayName: 'Y' },
    { symbol: 'y', dominant: false, displayName: 'y' },
  ],
  phenotypeMap: {
    YY: '黄色',
    Yy: '黄色',
    yY: '黄色',
    yy: '緑色',
  },
  phenotypeColorMap: {
    '黄色': '#F59E0B',
    '緑色': '#10B981',
  },
};

const peaSeedShapeGene: Gene = {
  name: 'seedShape',
  locus: 'R',
  alleles: [
    { symbol: 'R', dominant: true, displayName: 'R' },
    { symbol: 'r', dominant: false, displayName: 'r' },
  ],
  phenotypeMap: {
    RR: '丸',
    Rr: '丸',
    rR: '丸',
    rr: 'しわ',
  },
  phenotypeColorMap: {
    '丸': '#8B5CF6',
    'しわ': '#EC4899',
  },
};

const bloodTypeGene: Gene = {
  name: 'bloodType',
  locus: 'ABO',
  alleles: [
    { symbol: 'A', dominant: true, displayName: 'I^A' },
    { symbol: 'B', dominant: true, displayName: 'I^B' },
  ],
  phenotypeMap: {
    AA: 'A型',
    AO: 'A型',
    OA: 'A型',
    BB: 'B型',
    BO: 'B型',
    OB: 'B型',
    AB: 'AB型',
    BA: 'AB型',
    OO: 'O型',
  },
  phenotypeColorMap: {
    'A型': '#EF4444',
    'B型': '#3B82F6',
    'AB型': '#8B5CF6',
    'O型': '#6B7280',
  },
};

// For blood type, we need a special gene with 3 alleles
const bloodTypeGeneSpecial: Gene = {
  ...bloodTypeGene,
  alleles: [
    { symbol: 'A', dominant: true, displayName: 'I^A' },
    { symbol: 'O', dominant: false, displayName: 'i' },
  ],
};

export const presets: Preset[] = [
  {
    id: 'peaSeedColor',
    nameKey: 'peaSeedColor',
    genes: [peaSeedColorGene],
    parent1: [['Y', 'y']],
    parent2: [['Y', 'y']],
  },
  {
    id: 'peaSeedShape',
    nameKey: 'peaSeedShape',
    genes: [peaSeedShapeGene],
    parent1: [['R', 'r']],
    parent2: [['R', 'r']],
  },
  {
    id: 'bloodType',
    nameKey: 'bloodType',
    genes: [bloodTypeGeneSpecial],
    parent1: [['A', 'O']],
    parent2: [['A', 'O']],
  },
  {
    id: 'dihybrid',
    nameKey: 'dihybrid',
    genes: [peaSeedColorGene, peaSeedShapeGene],
    parent1: [['Y', 'y'], ['R', 'r']],
    parent2: [['Y', 'y'], ['R', 'r']],
  },
];

export default presets;
