import { useMemo } from 'react';
import type { Gene, AllelePair } from '../types/genetics';
import { generatePunnettSquare, gameteLabel } from '../utils/genetics';
import type { TranslationKeys } from '../i18n/translations';

interface Props {
  genes: Gene[];
  parent1Alleles: AllelePair[];
  parent2Alleles: AllelePair[];
  t: TranslationKeys;
}

export default function PunnettSquare({ genes, parent1Alleles, parent2Alleles, t }: Props) {
  const punnett = useMemo(
    () => generatePunnettSquare(genes, parent1Alleles, parent2Alleles),
    [genes, parent1Alleles, parent2Alleles]
  );

  const { motherGametes, fatherGametes, grid, genotypeRatios, phenotypeRatios } = punnett;

  return (
    <div className="flex flex-col gap-6">
      {/* Punnett Square */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-200">
          {t.cross.punnettSquare}
        </h3>
        <div className="overflow-x-auto">
          <table className="border-collapse mx-auto">
            <thead>
              <tr>
                <th className="p-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm">
                  {t.cross.mother}↓ / {t.cross.father}→
                </th>
                {fatherGametes.map((fg, j) => (
                  <th
                    key={j}
                    className="p-2 border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/30 text-center font-mono text-sm font-bold text-blue-700 dark:text-blue-300"
                  >
                    {gameteLabel(fg)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {motherGametes.map((mg, i) => (
                <tr key={i}>
                  <td className="p-2 border border-gray-300 dark:border-gray-600 bg-pink-50 dark:bg-pink-900/30 font-mono text-sm font-bold text-pink-700 dark:text-pink-300">
                    {gameteLabel(mg)}
                  </td>
                  {grid[i].map((cell, j) => (
                    <td
                      key={j}
                      className="p-2 border border-gray-300 dark:border-gray-600 text-center hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                    >
                      <div className="font-mono text-sm font-bold text-gray-800 dark:text-gray-200">
                        {cell.genotype}
                      </div>
                      <div className="flex gap-1 justify-center mt-1">
                        {cell.colors.map((c, ci) => (
                          <span
                            key={ci}
                            className="inline-block w-3 h-3 rounded-full"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {cell.phenotype}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ratios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Genotype Ratio */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-bold text-sm mb-2 text-gray-700 dark:text-gray-300">
            {t.cross.genotypeRatio}
          </h4>
          <div className="space-y-2">
            {Object.entries(genotypeRatios).map(([gt, ratio]) => (
              <div key={gt} className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold w-16 text-gray-800 dark:text-gray-200">
                  {gt}
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${ratio * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                  {(ratio * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Phenotype Ratio */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-bold text-sm mb-2 text-gray-700 dark:text-gray-300">
            {t.cross.phenotypeRatio}
          </h4>
          <div className="space-y-2">
            {Object.entries(phenotypeRatios).map(([pt, ratio]) => {
              const colorEntry = Object.entries(genes[0]?.phenotypeColorMap || {}).find(
                ([k]) => pt.includes(k)
              );
              const barColor = colorEntry?.[1] || '#6B7280';
              return (
                <div key={pt} className="flex items-center gap-2">
                  <span className="text-sm w-20 truncate text-gray-800 dark:text-gray-200">
                    {pt}
                  </span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${ratio * 100}%`, backgroundColor: barColor }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                    {(ratio * 100).toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
