import type { Localized } from '../types/genetics';

export type AchievementId =
  | 'firstSteps'
  | 'explorer'
  | 'meiosisMaster'
  | 'assortment'
  | 'cellInspector'
  | 'lethal'
  | 'bigData'
  | 'mendelReplica'
  | 'sharpshooter'
  | 'detective'
  | 'detectivePro'
  | 'puzzleSolver'
  | 'puzzleHard'
  | 'quizStreak'
  | 'quizPerfect';

export interface Achievement {
  id: AchievementId;
  icon: string;
  name: Localized;
  description: Localized;
}

export const achievements: Achievement[] = [
  {
    id: 'firstSteps',
    icon: '🌱',
    name: { ja: 'はじめの一歩', en: 'First Steps' },
    description: { ja: '親の遺伝子型を自分で変えてみた', en: 'Changed a parent genotype yourself' },
  },
  {
    id: 'explorer',
    icon: '🧭',
    name: { ja: '探検家', en: 'Explorer' },
    description: { ja: 'すべてのプリセットを試した', en: 'Tried every preset' },
  },
  {
    id: 'meiosisMaster',
    icon: '🧬',
    name: { ja: '分裂マスター', en: 'Meiosis Master' },
    description: { ja: '減数分裂を最後の配偶子まで観察した', en: 'Watched meiosis all the way to gametes' },
  },
  {
    id: 'assortment',
    icon: '🎰',
    name: { ja: '独立の法則の証人', en: 'Witness of Assortment' },
    description: {
      ja: '2遺伝子の減数分裂で4種類すべての配偶子を作った',
      en: 'Produced all 4 gamete types in dihybrid meiosis',
    },
  },
  {
    id: 'cellInspector',
    icon: '🔬',
    name: { ja: '観察眼', en: 'Sharp Eye' },
    description: { ja: 'パネット方眼のマスを調べて解説を読んだ', en: 'Inspected a Punnett square cell' },
  },
  {
    id: 'lethal',
    icon: '💀',
    name: { ja: '致死の謎', en: 'Lethal Mystery' },
    description: { ja: '致死遺伝子で比が 2:1 になる交配を見つけた', en: 'Found the 2:1 ratio caused by a lethal gene' },
  },
  {
    id: 'bigData',
    icon: '📊',
    name: { ja: '大数の法則', en: 'Law of Large Numbers' },
    description: { ja: '10,000個体の試行を実行した', en: 'Ran a 10,000-offspring trial' },
  },
  {
    id: 'mendelReplica',
    icon: '👨‍🔬',
    name: { ja: 'メンデルの再来', en: 'Mendel Reborn' },
    description: { ja: 'メンデルと同じ個体数で実験を再現した', en: "Replicated Mendel's experiment size" },
  },
  {
    id: 'sharpshooter',
    icon: '🎯',
    name: { ja: '予言者', en: 'Oracle' },
    description: { ja: '試行の予想を理論値±2%以内で当てた', en: 'Predicted within ±2% of theory' },
  },
  {
    id: 'detective',
    icon: '🔍',
    name: { ja: '名探偵', en: 'Detective' },
    description: { ja: '遺伝子型探偵で正解した', en: 'Solved a Genotype Detective case' },
  },
  {
    id: 'detectivePro',
    icon: '🕵️',
    name: { ja: '迷宮入りなし', en: 'No Cold Cases' },
    description: { ja: '遺伝子型探偵で5件解決した', en: 'Solved 5 Genotype Detective cases' },
  },
  {
    id: 'puzzleSolver',
    icon: '🧩',
    name: { ja: 'パズル解決', en: 'Puzzle Solver' },
    description: { ja: 'パネット穴埋めを完成させた', en: 'Completed a Punnett puzzle' },
  },
  {
    id: 'puzzleHard',
    icon: '🧠',
    name: { ja: 'ジーニアス', en: 'Genius' },
    description: { ja: '「むずかしい」パネット穴埋めを完成させた', en: 'Completed a hard Punnett puzzle' },
  },
  {
    id: 'quizStreak',
    icon: '🔥',
    name: { ja: '連続正解', en: 'On Fire' },
    description: { ja: 'クイズで5問連続正解した', en: 'Answered 5 quiz questions in a row' },
  },
  {
    id: 'quizPerfect',
    icon: '👑',
    name: { ja: 'パーフェクト', en: 'Perfect Score' },
    description: { ja: 'クイズ1ラウンドを全問正解した', en: 'Aced a full quiz round' },
  },
];

export interface LevelInfo {
  level: number;
  title: Localized;
  minXp: number;
  nextXp: number | null;
}

const LEVELS: { minXp: number; title: Localized }[] = [
  { minXp: 0, title: { ja: '見習い研究者', en: 'Apprentice' } },
  { minXp: 50, title: { ja: 'エンドウ栽培係', en: 'Pea Gardener' } },
  { minXp: 120, title: { ja: '遺伝の探究者', en: 'Gene Explorer' } },
  { minXp: 220, title: { ja: 'パネット職人', en: 'Punnett Artisan' } },
  { minXp: 350, title: { ja: '減数分裂の達人', en: 'Meiosis Adept' } },
  { minXp: 520, title: { ja: '遺伝学者', en: 'Geneticist' } },
  { minXp: 750, title: { ja: 'メンデルの弟子', en: "Mendel's Disciple" } },
  { minXp: 1000, title: { ja: '遺伝の賢者', en: 'Heredity Sage' } },
  { minXp: 1300, title: { ja: 'ノーベル級', en: 'Nobel-Class' } },
  { minXp: 1700, title: { ja: 'メンデル超え', en: 'Beyond Mendel' } },
];

export function levelFor(xp: number): LevelInfo {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].minXp) idx = i;
  }
  return {
    level: idx + 1,
    title: LEVELS[idx].title,
    minXp: LEVELS[idx].minXp,
    nextXp: LEVELS[idx + 1]?.minXp ?? null,
  };
}
