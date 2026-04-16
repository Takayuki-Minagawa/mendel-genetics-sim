import type { Gene, AllelePair, Gamete } from '../types/genetics';

export function getGenotypeName(_gene: Gene, pair: AllelePair): string {
  return pair[0] + pair[1];
}

export function getPhenotype(gene: Gene, pair: AllelePair): string {
  const key = pair[0] + pair[1];
  return gene.phenotypeMap[key] || 'Unknown';
}

export function getPhenotypeColor(gene: Gene, pair: AllelePair): string {
  const phenotype = getPhenotype(gene, pair);
  return gene.phenotypeColorMap[phenotype] || '#888888';
}

export function generateGametes(
  genes: Gene[],
  parentAlleles: AllelePair[]
): Gamete[] {
  if (genes.length === 0) return [];

  const combinations: Gamete[] = [];

  function recurse(geneIndex: number, current: { gene: Gene; allele: string }[]) {
    if (geneIndex >= genes.length) {
      combinations.push({ alleles: [...current] });
      return;
    }
    const pair = parentAlleles[geneIndex];
    const gene = genes[geneIndex];

    // First allele
    recurse(geneIndex + 1, [...current, { gene, allele: pair[0] }]);
    // Second allele (only if different to avoid duplicates)
    if (pair[0] !== pair[1]) {
      recurse(geneIndex + 1, [...current, { gene, allele: pair[1] }]);
    }
  }

  recurse(0, []);
  return combinations;
}

export function gameteLabel(gamete: Gamete): string {
  return gamete.alleles.map((a) => a.allele).join('');
}

export function crossGametes(
  g1: Gamete,
  g2: Gamete,
  genes: Gene[]
): { genotype: string; phenotype: string; colors: string[] } {
  const genotypeParts: string[] = [];
  const phenotypeParts: string[] = [];
  const colors: string[] = [];

  for (let i = 0; i < genes.length; i++) {
    const a1 = g1.alleles[i].allele;
    const a2 = g2.alleles[i].allele;
    const pair: AllelePair = [a1, a2];
    genotypeParts.push(a1 + a2);
    phenotypeParts.push(getPhenotype(genes[i], pair));
    colors.push(getPhenotypeColor(genes[i], pair));
  }

  return {
    genotype: genotypeParts.join(' '),
    phenotype: phenotypeParts.join(', '),
    colors,
  };
}

export function generatePunnettSquare(
  genes: Gene[],
  parent1Alleles: AllelePair[],
  parent2Alleles: AllelePair[]
): {
  motherGametes: Gamete[];
  fatherGametes: Gamete[];
  grid: { genotype: string; phenotype: string; colors: string[] }[][];
  genotypeRatios: Record<string, number>;
  phenotypeRatios: Record<string, number>;
} {
  const motherGametes = generateGametes(genes, parent1Alleles);
  const fatherGametes = generateGametes(genes, parent2Alleles);
  const total = motherGametes.length * fatherGametes.length;

  const grid: { genotype: string; phenotype: string; colors: string[] }[][] = [];
  const genotypeCount: Record<string, number> = {};
  const phenotypeCount: Record<string, number> = {};

  for (let i = 0; i < motherGametes.length; i++) {
    const row: { genotype: string; phenotype: string; colors: string[] }[] = [];
    for (let j = 0; j < fatherGametes.length; j++) {
      const result = crossGametes(motherGametes[i], fatherGametes[j], genes);
      row.push(result);
      genotypeCount[result.genotype] = (genotypeCount[result.genotype] || 0) + 1;
      phenotypeCount[result.phenotype] = (phenotypeCount[result.phenotype] || 0) + 1;
    }
    grid.push(row);
  }

  const genotypeRatios: Record<string, number> = {};
  const phenotypeRatios: Record<string, number> = {};
  for (const [k, v] of Object.entries(genotypeCount)) {
    genotypeRatios[k] = v / total;
  }
  for (const [k, v] of Object.entries(phenotypeCount)) {
    phenotypeRatios[k] = v / total;
  }

  return { motherGametes, fatherGametes, grid, genotypeRatios, phenotypeRatios };
}

export function runTrial(
  genes: Gene[],
  parent1Alleles: AllelePair[],
  parent2Alleles: AllelePair[],
  count: number
): { phenotype: string; colors: string[] }[] {
  const motherGametes = generateGametes(genes, parent1Alleles);
  const fatherGametes = generateGametes(genes, parent2Alleles);
  const results: { phenotype: string; colors: string[] }[] = [];

  for (let i = 0; i < count; i++) {
    const mg = motherGametes[Math.floor(Math.random() * motherGametes.length)];
    const fg = fatherGametes[Math.floor(Math.random() * fatherGametes.length)];
    const result = crossGametes(mg, fg, genes);
    results.push({ phenotype: result.phenotype, colors: result.colors });
  }

  return results;
}

export function normalizeAllelePair(pair: AllelePair): AllelePair {
  // Put dominant allele first
  if (pair[0] > pair[1]) return [pair[1], pair[0]];
  return pair;
}
