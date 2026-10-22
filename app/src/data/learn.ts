import type { Localized } from '../types/genetics';

export interface GlossaryTerm {
  term: Localized;
  definition: Localized;
}

export const glossary: GlossaryTerm[] = [
  {
    term: { ja: '遺伝子座', en: 'Locus' },
    definition: { ja: '染色体の上で、ある遺伝子が占めている位置。', en: 'The position a gene occupies on a chromosome.' },
  },
  {
    term: { ja: '対立遺伝子', en: 'Allele' },
    definition: {
      ja: '同じ遺伝子座にある、はたらきの異なる遺伝子どうし（例: Y と y）。',
      en: 'Different versions of a gene at the same locus (e.g. Y and y).',
    },
  },
  {
    term: { ja: '遺伝子型', en: 'Genotype' },
    definition: {
      ja: '個体がもつ遺伝子の組み合わせを記号で表したもの（例: Yy）。',
      en: 'The combination of alleles an individual carries, written with symbols (e.g. Yy).',
    },
  },
  {
    term: { ja: '表現型', en: 'Phenotype' },
    definition: { ja: '実際に外に現れる形質（例: 黄色の種子）。', en: 'The trait that actually shows (e.g. a yellow seed).' },
  },
  {
    term: { ja: 'ホモ接合', en: 'Homozygous' },
    definition: { ja: '同じ対立遺伝子を2つもつ状態（YY や yy）。', en: 'Having two identical alleles (YY or yy).' },
  },
  {
    term: { ja: 'ヘテロ接合', en: 'Heterozygous' },
    definition: { ja: '異なる対立遺伝子を1つずつもつ状態（Yy）。', en: 'Having two different alleles (Yy).' },
  },
  {
    term: { ja: '顕性・潜性', en: 'Dominant / Recessive' },
    definition: {
      ja: 'ヘテロ接合のときに現れる形質が顕性、隠れる形質が潜性。以前は「優性・劣性」と呼ばれていました。',
      en: 'The trait shown by a heterozygote is dominant; the hidden one is recessive.',
    },
  },
  {
    term: { ja: '相同染色体', en: 'Homologous chromosomes' },
    definition: {
      ja: '形と大きさが同じで、同じ遺伝子座をもつ1対の染色体。片方は父親、もう片方は母親から受け継ぎます。',
      en: 'A matching pair of chromosomes with the same loci — one inherited from each parent.',
    },
  },
  {
    term: { ja: '配偶子', en: 'Gamete' },
    definition: {
      ja: '卵や精子のように受精に関わる細胞。染色体を1セット(n)だけもちます。',
      en: 'A cell such as an egg or sperm that joins in fertilization. It carries one set (n) of chromosomes.',
    },
  },
  {
    term: { ja: '検定交雑', en: 'Test cross' },
    definition: {
      ja: '遺伝子型を調べたい個体を潜性ホモ接合体と交配すること。子の表現型の比から配偶子の種類がわかります。',
      en: 'Crossing an individual with a homozygous recessive to reveal its gametes from the offspring.',
    },
  },
  {
    term: { ja: '不完全顕性', en: 'Incomplete dominance' },
    definition: {
      ja: 'ヘテロ接合体が両親の中間の形質を示すこと（例: 赤×白 → 桃色）。',
      en: 'The heterozygote shows an intermediate trait (e.g. red × white → pink).',
    },
  },
  {
    term: { ja: '複対立遺伝子', en: 'Multiple alleles' },
    definition: {
      ja: '1つの遺伝子座に3種類以上の対立遺伝子があること（例: ABO式血液型の A, B, O）。',
      en: 'Three or more alleles exist for one locus (e.g. A, B and O for ABO blood type).',
    },
  },
];

export const funFacts: { icon: string; text: Localized }[] = [
  {
    icon: '⛪',
    text: {
      ja: 'メンデル（1822〜1884年）は、現在のチェコ・ブルノにあった修道院の司祭。修道院の庭でエンドウを育てて実験しました。',
      en: 'Gregor Mendel (1822–1884) was a friar at an abbey in Brno (now in Czechia). He grew his peas in the abbey garden.',
    },
  },
  {
    icon: '🌱',
    text: {
      ja: '1856〜1863年のおよそ8年間で、約28,000株もの植物（ほとんどがエンドウ）を育てて調べました。',
      en: 'From 1856 to 1863 he grew and studied about 28,000 plants — most of them peas.',
    },
  },
  {
    icon: '📜',
    text: {
      ja: '1865年に研究を発表しましたが、当時はほとんど理解されず、メンデルは評価されないまま亡くなりました。',
      en: 'He presented his work in 1865, but it was barely understood and he died without recognition.',
    },
  },
  {
    icon: '🔁',
    text: {
      ja: '1900年、ド・フリース、コレンス、チェルマクの3人がそれぞれ独立にメンデルの法則を「再発見」しました。',
      en: 'In 1900, de Vries, Correns and Tschermak independently "rediscovered" Mendel\'s laws.',
    },
  },
  {
    icon: '🫛',
    text: {
      ja: 'メンデルが調べた形質は7つ：種子の形、子葉の色、種皮の色、さやの形、さやの色、花のつく位置、茎の高さ。',
      en: 'Mendel studied 7 traits: seed shape, cotyledon color, seed-coat color, pod shape, pod color, flower position and stem length.',
    },
  },
  {
    icon: '🧬',
    text: {
      ja: 'しわ型の種子は、デンプンをつくる酵素の遺伝子に約800塩基対のDNA断片が入り込み、遺伝子が壊れたものだとわかっています（1990年）。',
      en: 'Wrinkled seeds come from an ~800 bp DNA insertion that breaks a starch-making enzyme gene (discovered in 1990).',
    },
  },
  {
    icon: '📈',
    text: {
      ja: '統計学者フィッシャーは1936年、メンデルのデータは「理論値に近すぎる」と指摘しました。この謎は今も議論されています。',
      en: 'In 1936 the statistician R. A. Fisher argued that Mendel\'s data were "too good" to be true — a debate that continues today.',
    },
  },
  {
    icon: '🗣️',
    text: {
      ja: '「優性・劣性」は優劣の意味に誤解されやすいため、2017年に日本遺伝学会が「顕性・潜性」への言い換えを提案しました。',
      en: 'Because "dominant/recessive" sounded like "superior/inferior" in Japanese, the Genetics Society of Japan proposed new terms in 2017.',
    },
  },
];
