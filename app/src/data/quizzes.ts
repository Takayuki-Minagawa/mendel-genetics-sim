export interface QuizQuestion {
  id: string;
  questionJa: string;
  questionEn: string;
  options: { ja: string; en: string }[];
  correctIndex: number;
  explanationJa: string;
  explanationEn: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    questionJa: 'Aa × Aa の交配で、劣性形質（aa）が現れる確率は？',
    questionEn: 'In a cross of Aa × Aa, what is the probability of the recessive phenotype (aa)?',
    options: [
      { ja: '1/4', en: '1/4' },
      { ja: '1/2', en: '1/2' },
      { ja: '3/4', en: '3/4' },
      { ja: '1/3', en: '1/3' },
    ],
    correctIndex: 0,
    explanationJa: 'Aa × Aa の交配では、AA:Aa:aa = 1:2:1 となり、劣性形質(aa)は1/4の確率で現れます。',
    explanationEn: 'In Aa × Aa cross, the ratio is AA:Aa:aa = 1:2:1, so the recessive phenotype (aa) appears with 1/4 probability.',
  },
  {
    id: 'q2',
    questionJa: 'AaBb × AaBb の交配で生じる配偶子の種類は何通り？',
    questionEn: 'How many types of gametes can AaBb produce?',
    options: [
      { ja: '2通り', en: '2 types' },
      { ja: '4通り', en: '4 types' },
      { ja: '8通り', en: '8 types' },
      { ja: '16通り', en: '16 types' },
    ],
    correctIndex: 1,
    explanationJa: 'AaBb個体は、AB, Ab, aB, ab の4種類の配偶子を作ります（独立の法則）。',
    explanationEn: 'An AaBb individual produces 4 types of gametes: AB, Ab, aB, ab (Law of Independent Assortment).',
  },
  {
    id: 'q3',
    questionJa: '減数分裂で染色体数が半分になるのは第何分裂？',
    questionEn: 'In which division of meiosis does the chromosome number halve?',
    options: [
      { ja: '第一分裂', en: 'Meiosis I' },
      { ja: '第二分裂', en: 'Meiosis II' },
      { ja: '両方', en: 'Both' },
      { ja: 'どちらでもない', en: 'Neither' },
    ],
    correctIndex: 0,
    explanationJa: '第一分裂で相同染色体が分離し、染色体数が半減します（還元分裂）。第二分裂は姉妹染色分体の分離です。',
    explanationEn: 'In Meiosis I, homologous chromosomes separate, halving the chromosome number (reduction division). Meiosis II separates sister chromatids.',
  },
  {
    id: 'q4',
    questionJa: 'AA × aa の交配のF1世代の遺伝子型は？',
    questionEn: 'What is the genotype of the F1 generation from AA × aa?',
    options: [
      { ja: 'すべてAA', en: 'All AA' },
      { ja: 'すべてAa', en: 'All Aa' },
      { ja: 'すべてaa', en: 'All aa' },
      { ja: 'AA:Aa:aa = 1:2:1', en: 'AA:Aa:aa = 1:2:1' },
    ],
    correctIndex: 1,
    explanationJa: 'AA親はAのみ、aa親はaのみの配偶子を作るため、F1はすべてAa（ヘテロ接合体）となります。',
    explanationEn: 'AA parent produces only A gametes, aa parent produces only a gametes, so all F1 are Aa (heterozygous).',
  },
  {
    id: 'q5',
    questionJa: '血液型がA型（AO）とB型（BO）の親からO型の子が生まれる確率は？',
    questionEn: 'What is the probability of type O offspring from AO × BO parents?',
    options: [
      { ja: '0', en: '0' },
      { ja: '1/4', en: '1/4' },
      { ja: '1/2', en: '1/2' },
      { ja: '1/3', en: '1/3' },
    ],
    correctIndex: 1,
    explanationJa: 'AO × BO → AB, AO, BO, OO の4通り。O型(OO)は1/4の確率で生まれます。',
    explanationEn: 'AO × BO → AB, AO, BO, OO (4 possibilities). Type O (OO) appears with 1/4 probability.',
  },
  {
    id: 'q6',
    questionJa: '分離の法則が成り立つのは、減数分裂のどの過程？',
    questionEn: 'Which meiotic process demonstrates the Law of Segregation?',
    options: [
      { ja: 'DNA複製', en: 'DNA replication' },
      { ja: '相同染色体の対合', en: 'Synapsis of homologs' },
      { ja: '相同染色体の分離（第一分裂後期）', en: 'Separation of homologs (Anaphase I)' },
      { ja: '姉妹染色分体の分離', en: 'Separation of sister chromatids' },
    ],
    correctIndex: 2,
    explanationJa: '分離の法則は、減数第一分裂の後期に相同染色体（対立遺伝子を含む）が分離することで実現されます。',
    explanationEn: 'The Law of Segregation is realized when homologous chromosomes (carrying alleles) separate during Anaphase I of Meiosis.',
  },
];
