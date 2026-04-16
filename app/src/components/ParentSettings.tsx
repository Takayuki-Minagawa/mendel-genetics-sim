import type { Gene, AllelePair } from '../types/genetics';
import { getPhenotype, getPhenotypeColor } from '../utils/genetics';
import type { TranslationKeys } from '../i18n/translations';

interface Props {
  genes: Gene[];
  parent1Alleles: AllelePair[];
  parent2Alleles: AllelePair[];
  onParent1Change: (alleles: AllelePair[]) => void;
  onParent2Change: (alleles: AllelePair[]) => void;
  t: TranslationKeys;
}

export default function ParentSettings({
  genes,
  parent1Alleles,
  parent2Alleles,
  onParent1Change,
  onParent2Change,
  t,
}: Props) {
  const uniqueGenotypes = (gene: Gene): AllelePair[] => {
    const symbols = gene.alleles.map((a) => a.symbol);
    const pairs: AllelePair[] = [];
    for (let i = 0; i < symbols.length; i++) {
      for (let j = i; j < symbols.length; j++) {
        pairs.push([symbols[i], symbols[j]]);
      }
    }
    return pairs;
  };

  const handleAlleleChange = (
    parentIndex: 0 | 1,
    geneIndex: number,
    value: string
  ) => {
    const pair = value.split(',') as [string, string];
    if (parentIndex === 0) {
      const newAlleles = [...parent1Alleles];
      newAlleles[geneIndex] = pair;
      onParent1Change(newAlleles);
    } else {
      const newAlleles = [...parent2Alleles];
      newAlleles[geneIndex] = pair;
      onParent2Change(newAlleles);
    }
  };

  const renderParent = (
    label: string,
    alleles: AllelePair[],
    parentIndex: 0 | 1
  ) => (
    <div className="flex-1 min-w-[200px] bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <h4 className="font-bold text-sm mb-3 text-gray-700 dark:text-gray-300">{label}</h4>
      {genes.map((gene, gi) => {
        const currentPair = alleles[gi] || [gene.alleles[0].symbol, gene.alleles[0].symbol];
        const phenotype = getPhenotype(gene, currentPair);
        const color = getPhenotypeColor(gene, currentPair);
        const genotypes = uniqueGenotypes(gene);

        return (
          <div key={gi} className="mb-3">
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
              {gene.locus}
            </label>
            <div className="flex items-center gap-2">
              <select
                value={currentPair.join(',')}
                onChange={(e) => handleAlleleChange(parentIndex, gi, e.target.value)}
                className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 flex-1"
              >
                {genotypes.map((geno) => (
                  <option key={geno.join(',')} value={geno.join(',')}>
                    {geno.join('')}
                  </option>
                ))}
              </select>
              <span
                className="inline-block w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: color }}
                title={phenotype}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">{phenotype}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex gap-4 flex-wrap">
      {renderParent(t.controls.parent1, parent1Alleles, 0)}
      <div className="flex items-center text-2xl text-gray-400 dark:text-gray-500 font-bold self-center">
        ×
      </div>
      {renderParent(t.controls.parent2, parent2Alleles, 1)}
    </div>
  );
}
