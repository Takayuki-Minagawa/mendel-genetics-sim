import type { Localized, MeiosisStage } from '../types/genetics';

export const STAGES: MeiosisStage[] = [
  'interphase',
  'replication',
  'prophase1',
  'metaphase1',
  'anaphase1',
  'telophase1',
  'metaphase2',
  'anaphase2',
  'telophase2',
  'gametes',
];

export const stageInfo: Record<MeiosisStage, { icon: string; text: Localized; law?: 'segregation' | 'independent' }> = {
  interphase: {
    icon: '🔵',
    text: {
      ja: '細胞の中に、同じ遺伝子座をもつ染色体が2本ずつ（相同染色体）あります。青は父親由来、赤は母親由来の染色体です。',
      en: 'The cell holds pairs of homologous chromosomes that carry the same gene loci. Blue came from the father, red from the mother.',
    },
  },
  replication: {
    icon: '🧪',
    text: {
      ja: 'DNAが複製され、各染色体は2本の姉妹染色分体が動原体でくっついた形になります。対立遺伝子もコピーされます。',
      en: 'DNA is copied: each chromosome becomes two sister chromatids joined at the centromere. Alleles are copied too.',
    },
  },
  prophase1: {
    icon: '🤝',
    text: {
      ja: '相同染色体どうしが並んで対合し、二価染色体をつくります（このとき乗換えが起こることもあります）。',
      en: 'Homologous chromosomes pair up (synapsis) to form bivalents. Crossing over can happen here.',
    },
  },
  metaphase1: {
    icon: '🎲',
    law: 'independent',
    text: {
      ja: '二価染色体が赤道面に並びます。どちらの染色体が左右どちらを向くかはランダム！ これが「独立の法則」の正体です。',
      en: 'Bivalents line up at the equator. Which homolog faces which pole is random — this is the basis of independent assortment!',
    },
  },
  anaphase1: {
    icon: '↔️',
    law: 'segregation',
    text: {
      ja: '相同染色体が分かれて両極へ移動します。対立遺伝子のペアが別々の細胞へ ─ これが「分離の法則」です。',
      en: 'Homologs separate to opposite poles. Each allele pair is split between cells — the Law of Segregation.',
    },
  },
  telophase1: {
    icon: '✂️',
    text: {
      ja: '細胞質が分裂して2つの細胞になります。染色体数は半分（2n → n）に減りました。',
      en: 'The cytoplasm divides into two cells. The chromosome number is now halved (2n → n).',
    },
  },
  metaphase2: {
    icon: '📏',
    text: {
      ja: 'それぞれの細胞で、染色体が再び赤道面に並びます。DNAの複製は起こりません。',
      en: 'In each cell, chromosomes line up at the equator again. No DNA replication happens before this.',
    },
  },
  anaphase2: {
    icon: '🪢',
    text: {
      ja: '姉妹染色分体が動原体で分かれ、両極へ移動します。',
      en: 'Sister chromatids split at the centromere and move to opposite poles.',
    },
  },
  telophase2: {
    icon: '🫧',
    text: {
      ja: 'さらに細胞質が分裂し、合計4つの細胞ができます。',
      en: 'The cytoplasm divides again, giving four cells in total.',
    },
  },
  gametes: {
    icon: '🎉',
    text: {
      ja: '1つの母細胞から、遺伝子を1セット（n）ずつもつ4つの配偶子ができました。「もう一度」を押すと別の組み合わせになるかも？',
      en: 'One cell has produced four gametes, each with one set (n) of genes. Press "Again" — you may get a different combination!',
    },
  },
};
