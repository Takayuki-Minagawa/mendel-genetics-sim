export type Language = 'ja' | 'en';

export interface Localized {
  ja: string;
  en: string;
}

export interface Allele {
  symbol: string;
}

export interface Phenotype {
  id: string;
  name: Localized;
  color: string;
  lethal?: boolean;
}

export type Trait = 'seedColor' | 'seedShape' | 'flowerColor' | 'bloodType' | 'furColor';

export type Inheritance = 'complete' | 'incomplete' | 'codominant' | 'lethal';

export interface Gene {
  id: string;
  locus: string;
  trait: Trait;
  name: Localized;
  inheritance: Inheritance;
  // Alleles are listed in dominance order; genotypes are normalized to this order.
  alleles: Allele[];
  // normalized genotype string (e.g. "Yy") -> phenotype id
  phenotypeMap: Record<string, string>;
  phenotypes: Record<string, Phenotype>;
}

export type AllelePair = [string, string];

export interface Gamete {
  alleles: string[];
}

export interface Offspring {
  pairs: AllelePair[];
  genotype: string;
  phenotypeIds: string[];
  // Phenotype ids joined with "|", used as a grouping key
  key: string;
  lethal: boolean;
}

export interface Preset {
  id: string;
  icon: string;
  name: Localized;
  description: Localized;
  genes: Gene[];
  parent1: AllelePair[];
  parent2: AllelePair[];
  // Mendel's published F2 counts, keyed by phenotype key
  mendelData?: Record<string, number>;
}

export type MeiosisStage =
  | 'interphase'
  | 'replication'
  | 'prophase1'
  | 'metaphase1'
  | 'anaphase1'
  | 'telophase1'
  | 'metaphase2'
  | 'anaphase2'
  | 'telophase2'
  | 'gametes';
