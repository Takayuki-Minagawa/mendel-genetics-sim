import type { Gene, AllelePair, Language } from '../types/genetics';
import { getPhenotype, possibleGenotypes, makeOffspring, phenotypeLabel, isHomozygous } from '../utils/genetics';
import type { TranslationKeys } from '../i18n/translations';
import OrganismIcon from './OrganismIcon';

interface Props {
  genes: Gene[];
  parent1Alleles: AllelePair[];
  parent2Alleles: AllelePair[];
  onParentChange: (parentIndex: 0 | 1, alleles: AllelePair[]) => void;
  t: TranslationKeys;
  lang: Language;
}

export default function ParentSettings({ genes, parent1Alleles, parent2Alleles, onParentChange, t, lang }: Props) {
  const handleChange = (parentIndex: 0 | 1, geneIndex: number, pair: AllelePair) => {
    const next = [...(parentIndex === 0 ? parent1Alleles : parent2Alleles)];
    next[geneIndex] = pair;
    onParentChange(parentIndex, next);
  };

  const renderParent = (alleles: AllelePair[], parentIndex: 0 | 1) => {
    const self = makeOffspring(genes, alleles);
    const isMother = parentIndex === 0;
    return (
      <div
        className={`flex-1 min-w-[240px] rounded-2xl p-4 border-2 ${
          isMother
            ? 'bg-pink-50/70 border-pink-200 dark:bg-pink-950/30 dark:border-pink-900'
            : 'bg-sky-50/70 border-sky-200 dark:bg-sky-950/30 dark:border-sky-900'
        }`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="shrink-0 rounded-2xl bg-white/80 dark:bg-slate-800/80 p-1.5 shadow-sm">
            <OrganismIcon
              key={self.key}
              genes={genes}
              phenotypeIds={self.phenotypeIds}
              size={56}
              className="animate-pop-in"
              title={phenotypeLabel(genes, self.key, lang)}
            />
          </div>
          <div className="min-w-0">
            <h3
              className={`font-bold text-sm ${
                isMother ? 'text-pink-600 dark:text-pink-300' : 'text-sky-600 dark:text-sky-300'
              }`}
            >
              {isMother ? t.controls.parent1 : t.controls.parent2}
            </h3>
            <p className="font-mono text-xl font-extrabold tracking-wide text-slate-800 dark:text-slate-100">
              {self.genotype}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.controls.phenotype}: {phenotypeLabel(genes, self.key, lang)}
            </p>
          </div>
        </div>

        {genes.map((gene, gi) => {
          const current = alleles[gi];
          return (
            <div key={gene.id} className="mb-2 last:mb-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                {lang === 'ja' ? `${gene.name.ja}（${gene.locus}）` : `${gene.name.en} (${gene.locus})`}
              </p>
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={gene.name[lang]}>
                {possibleGenotypes(gene).map((pair) => {
                  const active = current[0] === pair[0] && current[1] === pair[1];
                  const pheno = getPhenotype(gene, pair);
                  return (
                    <button
                      key={pair.join('')}
                      role="radio"
                      aria-checked={active}
                      onClick={() => handleChange(parentIndex, gi, pair)}
                      title={`${pheno.name[lang]} / ${isHomozygous(pair) ? t.controls.homozygous : t.controls.heterozygous}`}
                      className={`group flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full text-sm font-mono font-bold transition-all border ${
                        active
                          ? isMother
                            ? 'bg-pink-500 border-pink-500 text-white shadow-md scale-105'
                            : 'bg-sky-500 border-sky-500 text-white shadow-md scale-105'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:-translate-y-0.5 hover:shadow'
                      }`}
                    >
                      <span
                        className="inline-block w-3.5 h-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: pheno.color }}
                      />
                      {pair.join('')}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex gap-3 flex-wrap items-stretch">
      {renderParent(parent1Alleles, 0)}
      <div className="flex items-center justify-center w-full sm:w-auto">
        <span className="animate-float inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-pink-400 text-white text-xl font-black shadow">
          ×
        </span>
      </div>
      {renderParent(parent2Alleles, 1)}
    </div>
  );
}
