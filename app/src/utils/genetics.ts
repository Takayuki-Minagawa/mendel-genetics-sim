import type { Gene, AllelePair, Gamete, Offspring, Phenotype, Language } from '../types/genetics';

const MULTI_GENE_PALETTE = ['#F5B700', '#8B5CF6', '#5DAE3B', '#EC4899', '#3B82F6', '#F97316', '#14B8A6', '#EF4444', '#6B7280'];

function alleleRank(gene: Gene, symbol: string): number {
  const idx = gene.alleles.findIndex((a) => a.symbol === symbol);
  return idx === -1 ? gene.alleles.length : idx;
}

// Put the allele that comes first in the gene's dominance order first (e.g. "yY" -> "Yy")
export function normalizeAllelePair(gene: Gene, pair: AllelePair): AllelePair {
  if (alleleRank(gene, pair[0]) > alleleRank(gene, pair[1])) return [pair[1], pair[0]];
  return pair;
}

export function isHomozygous(pair: AllelePair): boolean {
  return pair[0] === pair[1];
}

export function getPhenotype(gene: Gene, pair: AllelePair): Phenotype {
  const [a, b] = normalizeAllelePair(gene, pair);
  const id = gene.phenotypeMap[a + b];
  return gene.phenotypes[id] ?? { id: 'unknown', name: { ja: '不明', en: 'Unknown' }, color: '#888888' };
}

export function possibleGenotypes(gene: Gene, includeLethal = false): AllelePair[] {
  const symbols = gene.alleles.map((a) => a.symbol);
  const pairs: AllelePair[] = [];
  for (let i = 0; i < symbols.length; i++) {
    for (let j = i; j < symbols.length; j++) {
      const pair: AllelePair = [symbols[i], symbols[j]];
      if (includeLethal || !getPhenotype(gene, pair).lethal) pairs.push(pair);
    }
  }
  return pairs;
}

export function genotypeString(pairs: AllelePair[]): string {
  return pairs.map((p) => p[0] + p[1]).join('');
}

export function makeOffspring(genes: Gene[], pairs: AllelePair[]): Offspring {
  const normalized = genes.map((g, i) => normalizeAllelePair(g, pairs[i]));
  const phenos = genes.map((g, i) => getPhenotype(g, normalized[i]));
  return {
    pairs: normalized,
    genotype: genotypeString(normalized),
    phenotypeIds: phenos.map((p) => p.id),
    key: phenos.map((p) => p.id).join('|'),
    lethal: phenos.some((p) => p.lethal),
  };
}

export function generateGametes(genes: Gene[], parentAlleles: AllelePair[], dedupe = true): Gamete[] {
  if (genes.length === 0) return [];
  const combinations: Gamete[] = [];

  function recurse(geneIndex: number, current: string[]) {
    if (geneIndex >= genes.length) {
      combinations.push({ alleles: [...current] });
      return;
    }
    const pair = parentAlleles[geneIndex];
    recurse(geneIndex + 1, [...current, pair[0]]);
    if (!dedupe || pair[0] !== pair[1]) {
      recurse(geneIndex + 1, [...current, pair[1]]);
    }
  }

  recurse(0, []);
  return combinations;
}

export function gameteLabel(gamete: Gamete): string {
  return gamete.alleles.join('');
}

export function fertilize(genes: Gene[], g1: Gamete, g2: Gamete): Offspring {
  return makeOffspring(
    genes,
    genes.map((_, i) => [g1.alleles[i], g2.alleles[i]] as AllelePair)
  );
}

// All phenotype keys for a gene set, in display order (dominant first)
export function phenotypeOrder(genes: Gene[]): string[] {
  let keys: string[][] = [[]];
  for (const gene of genes) {
    const ids = Object.keys(gene.phenotypes);
    keys = keys.flatMap((k) => ids.map((id) => [...k, id]));
  }
  return keys.map((k) => k.join('|'));
}

function genotypeSortKey(genes: Gene[], pairs: AllelePair[]): number {
  return pairs.reduce((acc, pair, i) => {
    const all = possibleGenotypes(genes[i], true);
    const idx = all.findIndex((p) => p[0] === pair[0] && p[1] === pair[1]);
    return acc * 10 + idx;
  }, 0);
}

export function phenotypeLabel(genes: Gene[], key: string, lang: Language): string {
  const ids = key.split('|');
  return ids
    .map((id, i) => genes[i]?.phenotypes[id]?.name[lang] ?? id)
    .join(lang === 'ja' ? '・' : ', ');
}

export function phenotypeColor(genes: Gene[], key: string): string {
  if (genes.length === 1) return genes[0].phenotypes[key]?.color ?? '#6B7280';
  const idx = phenotypeOrder(genes).indexOf(key);
  return MULTI_GENE_PALETTE[idx % MULTI_GENE_PALETTE.length] ?? '#6B7280';
}

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function simplifyRatio(values: number[]): number[] {
  const ints = values.map((v) => Math.round(v));
  const g = ints.reduce((acc, v) => gcd(acc, v), 0) || 1;
  return ints.map((v) => v / g);
}

export interface CountEntry {
  key: string;
  count: number;
}

export interface PunnettResult {
  motherGametes: Gamete[];
  fatherGametes: Gamete[];
  grid: Offspring[][];
  genotypeCounts: CountEntry[];
  phenotypeCounts: CountEntry[];
  total: number;
  viableTotal: number;
  lethalCount: number;
}

export function generatePunnettSquare(
  genes: Gene[],
  parent1Alleles: AllelePair[],
  parent2Alleles: AllelePair[],
  dedupe = true
): PunnettResult {
  const motherGametes = generateGametes(genes, parent1Alleles, dedupe);
  const fatherGametes = generateGametes(genes, parent2Alleles, dedupe);

  const grid: Offspring[][] = [];
  const genotypeCount = new Map<string, { count: number; pairs: AllelePair[] }>();
  const phenotypeCount = new Map<string, number>();
  let lethalCount = 0;

  for (const mg of motherGametes) {
    const row: Offspring[] = [];
    for (const fg of fatherGametes) {
      const child = fertilize(genes, mg, fg);
      row.push(child);
      const entry = genotypeCount.get(child.genotype) ?? { count: 0, pairs: child.pairs };
      entry.count++;
      genotypeCount.set(child.genotype, entry);
      if (child.lethal) lethalCount++;
      else phenotypeCount.set(child.key, (phenotypeCount.get(child.key) ?? 0) + 1);
    }
    grid.push(row);
  }

  const order = phenotypeOrder(genes);
  const total = motherGametes.length * fatherGametes.length;

  return {
    motherGametes,
    fatherGametes,
    grid,
    genotypeCounts: [...genotypeCount.entries()]
      .sort((a, b) => genotypeSortKey(genes, a[1].pairs) - genotypeSortKey(genes, b[1].pairs))
      .map(([key, v]) => ({ key, count: v.count })),
    phenotypeCounts: [...phenotypeCount.entries()]
      .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
      .map(([key, count]) => ({ key, count })),
    total,
    viableTotal: total - lethalCount,
    lethalCount,
  };
}

// Probability of each viable phenotype, in display order
export function theoreticalRatios(
  genes: Gene[],
  parent1Alleles: AllelePair[],
  parent2Alleles: AllelePair[]
): CountEntry[] {
  const p = generatePunnettSquare(genes, parent1Alleles, parent2Alleles, false);
  return p.phenotypeCounts.map((e) => ({ key: e.key, count: e.count / p.viableTotal }));
}

export function sampleOffspring(
  genes: Gene[],
  parent1Alleles: AllelePair[],
  parent2Alleles: AllelePair[],
  includeLethal = false
): Offspring {
  for (let tries = 0; tries < 1000; tries++) {
    const pairs = genes.map(
      (_, i) =>
        [
          parent1Alleles[i][Math.random() < 0.5 ? 0 : 1],
          parent2Alleles[i][Math.random() < 0.5 ? 0 : 1],
        ] as AllelePair
    );
    const child = makeOffspring(genes, pairs);
    if (includeLethal || !child.lethal) return child;
  }
  return makeOffspring(genes, parent1Alleles);
}

export function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
