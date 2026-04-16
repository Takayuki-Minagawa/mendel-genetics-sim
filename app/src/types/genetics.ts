export interface Allele {
  symbol: string;
  dominant: boolean;
  displayName?: string;
}

export interface Gene {
  name: string;
  locus: string;
  alleles: [Allele, Allele]; // two possible alleles
  phenotypeMap: Record<string, string>; // genotype string -> phenotype
  phenotypeColorMap: Record<string, string>; // phenotype -> color
}

export type AllelePair = [string, string];

export interface Genotype {
  genes: { gene: Gene; alleles: AllelePair }[];
}

export interface Gamete {
  alleles: { gene: Gene; allele: string }[];
}

export interface CrossResult {
  genotype: string;
  phenotype: string;
  color: string;
  probability: number;
}

export interface Preset {
  id: string;
  nameKey: string;
  genes: Gene[];
  parent1: AllelePair[];
  parent2: AllelePair[];
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
