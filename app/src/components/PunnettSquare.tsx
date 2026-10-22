import { useMemo, useState, useEffect } from 'react';
import type { Gene, AllelePair, Language, Offspring } from '../types/genetics';
import {
  generatePunnettSquare,
  gameteLabel,
  phenotypeLabel,
  phenotypeColor,
  simplifyRatio,
} from '../utils/genetics';
import { geneReason } from '../utils/explain';
import { fmt, type TranslationKeys } from '../i18n/translations';
import OrganismIcon from './OrganismIcon';
import { useProgress } from '../progress/useProgress';

interface Props {
  genes: Gene[];
  parent1Alleles: AllelePair[];
  parent2Alleles: AllelePair[];
  t: TranslationKeys;
  lang: Language;
}

function RatioLine({
  items,
  genes,
  lang,
  withIcons,
}: {
  items: { key: string; label: string; count: number }[];
  genes: Gene[];
  lang: Language;
  withIcons: boolean;
}) {
  const ratio = simplifyRatio(items.map((i) => i.count));
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
      {items.map((item, i) => (
        <span key={item.key} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-slate-400 font-bold mr-1">:</span>}
          {withIcons && (
            <OrganismIcon genes={genes} phenotypeIds={item.key.split('|')} size={26} title={phenotypeLabel(genes, item.key, lang)} />
          )}
          <span className={withIcons ? 'text-sm text-slate-700 dark:text-slate-200' : 'font-mono font-bold text-slate-800 dark:text-slate-100'}>
            {item.label}
          </span>
        </span>
      ))}
      <span className="mx-1 text-slate-400 font-bold">=</span>
      <span className="text-2xl font-black tracking-wide bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">
        {ratio.join(' : ')}
      </span>
    </div>
  );
}

export default function PunnettSquare({ genes, parent1Alleles, parent2Alleles, t, lang }: Props) {
  const { unlock } = useProgress();
  const punnett = useMemo(
    () => generatePunnettSquare(genes, parent1Alleles, parent2Alleles),
    [genes, parent1Alleles, parent2Alleles]
  );
  const configKey = `${genes.map((g) => g.id).join()}-${JSON.stringify(parent1Alleles)}-${JSON.stringify(parent2Alleles)}`;
  const [selected, setSelected] = useState<{ i: number; j: number; cfg: string } | null>(null);
  const [hover, setHover] = useState<{ i: number; j: number } | null>(null);

  const { motherGametes, fatherGametes, grid, genotypeCounts, phenotypeCounts, total, viableTotal, lethalCount } = punnett;

  useEffect(() => {
    if (lethalCount > 0 && viableTotal > 0) unlock('lethal');
  }, [lethalCount, viableTotal, unlock]);

  const sel = selected && selected.cfg === configKey ? selected : null;
  const selCell: Offspring | null = sel ? grid[sel.i]?.[sel.j] ?? null : null;
  const cellSize = genes.length > 1 ? 'min-w-[68px] sm:min-w-[84px]' : 'min-w-[96px] sm:min-w-[120px]';
  const iconSize = genes.length > 1 ? 34 : 48;

  const handleCellClick = (i: number, j: number) => {
    setSelected({ i, j, cfg: configKey });
    unlock('cellInspector');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">🟩 {t.cross.punnettSquare}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">👆 {t.cross.clickHint}</p>
      </div>

      <div className="grid lg:grid-cols-[auto_1fr] gap-6 items-start">
        {/* Punnett grid */}
        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <table key={configKey} className="border-separate border-spacing-1.5 mx-auto">
            <thead>
              <tr>
                <th className="p-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span className="text-pink-500">♀ {t.cross.mother}</span>
                  <span className="mx-1">\</span>
                  <span className="text-sky-500">♂ {t.cross.father}</span>
                </th>
                {fatherGametes.map((fg, j) => (
                  <th key={j} className="p-1">
                    <span
                      className={`inline-flex items-center justify-center min-w-11 h-11 px-2 rounded-full font-mono text-base font-bold transition-all ${
                        hover?.j === j || sel?.j === j
                          ? 'bg-sky-500 text-white scale-110 shadow-md'
                          : 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-200'
                      }`}
                    >
                      {gameteLabel(fg)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {motherGametes.map((mg, i) => (
                <tr key={i}>
                  <th className="p-1">
                    <span
                      className={`inline-flex items-center justify-center min-w-11 h-11 px-2 rounded-full font-mono text-base font-bold transition-all ${
                        hover?.i === i || sel?.i === i
                          ? 'bg-pink-500 text-white scale-110 shadow-md'
                          : 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-200'
                      }`}
                    >
                      {gameteLabel(mg)}
                    </span>
                  </th>
                  {grid[i].map((cell, j) => {
                    const isSel = sel?.i === i && sel?.j === j;
                    return (
                      <td key={j} className="p-0">
                        <button
                          onClick={() => handleCellClick(i, j)}
                          onMouseEnter={() => setHover({ i, j })}
                          onMouseLeave={() => setHover(null)}
                          onFocus={() => setHover({ i, j })}
                          onBlur={() => setHover(null)}
                          style={{ animationDelay: `${(i * fatherGametes.length + j) * 45}ms` }}
                          className={`animate-pop-in ${cellSize} w-full flex flex-col items-center gap-0.5 rounded-xl p-2 border-2 transition-all ${
                            cell.lethal
                              ? 'bg-slate-100 dark:bg-slate-800 border-dashed border-slate-300 dark:border-slate-600 opacity-80'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          } ${
                            isSel
                              ? 'ring-4 ring-amber-300 dark:ring-amber-500 border-amber-400 scale-105'
                              : 'hover:border-amber-300 hover:-translate-y-0.5 hover:shadow-md'
                          }`}
                        >
                          <OrganismIcon genes={genes} phenotypeIds={cell.phenotypeIds} size={iconSize} />
                          <span className="font-mono text-sm font-extrabold text-slate-800 dark:text-slate-100">
                            {cell.genotype}
                          </span>
                          <span className="text-[10px] leading-tight text-slate-500 dark:text-slate-400 text-center">
                            {phenotypeLabel(genes, cell.key, lang)}
                          </span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cell explanation */}
        <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 min-h-[140px]">
          <h3 className="font-bold text-amber-700 dark:text-amber-300 mb-2">🔬 {t.cross.cellTitle}</h3>
          {sel && selCell ? (
            <div key={`${sel.i}-${sel.j}`} className="animate-fade-up space-y-2 text-sm text-slate-700 dark:text-slate-200">
              <p className="flex flex-wrap items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white font-mono font-bold">
                  ♀ {gameteLabel(motherGametes[sel.i])}
                </span>
                <span>+</span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500 text-white font-mono font-bold">
                  ♂ {gameteLabel(fatherGametes[sel.j])}
                </span>
                <span>→ {t.cross.fertilized}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-white font-mono font-bold">{selCell.genotype}</span>
              </p>
              <ul className="space-y-1 list-none">
                {genes.map((g, gi) => (
                  <li key={g.id} className="flex gap-2">
                    <span>🧬</span>
                    <span>{geneReason(g, selCell.pairs[gi], t, lang)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-3 pt-1">
                <OrganismIcon genes={genes} phenotypeIds={selCell.phenotypeIds} size={52} className="animate-pop-in" />
                <p className="font-bold">
                  {t.controls.phenotype}: {phenotypeLabel(genes, selCell.key, lang)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.cross.cellPrompt}</p>
          )}
        </div>
      </div>

      {lethalCount > 0 && (
        <div className="rounded-2xl bg-slate-800 text-slate-100 p-4 text-sm flex gap-3 items-start">
          <span className="text-2xl">💀</span>
          <p>{fmt(t.cross.lethalNote, { n: lethalCount, total })}</p>
        </div>
      )}

      {/* Ratios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-sm mb-3 text-slate-600 dark:text-slate-300">{t.cross.phenotypeRatio}</h3>
          {viableTotal > 0 && (
            <RatioLine
              genes={genes}
              lang={lang}
              withIcons
              items={phenotypeCounts.map((e) => ({ key: e.key, label: phenotypeLabel(genes, e.key, lang), count: e.count }))}
            />
          )}
          <div className="space-y-2 mt-4">
            {phenotypeCounts.map((e) => {
              const ratio = e.count / viableTotal;
              return (
                <div key={e.key} className="flex items-center gap-2">
                  <span className="text-xs w-24 truncate text-slate-700 dark:text-slate-300">{phenotypeLabel(genes, e.key, lang)}</span>
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${ratio * 100}%`, backgroundColor: phenotypeColor(genes, e.key) }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 w-12 text-right tabular-nums">
                    {(ratio * 100).toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-sm mb-3 text-slate-600 dark:text-slate-300">{t.cross.genotypeRatio}</h3>
          <RatioLine
            genes={genes}
            lang={lang}
            withIcons={false}
            items={genotypeCounts.map((e) => ({ key: e.key, label: e.key, count: e.count }))}
          />
          <div className="space-y-2 mt-4">
            {genotypeCounts.map((e) => {
              const ratio = e.count / total;
              return (
                <div key={e.key} className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold w-16 text-slate-800 dark:text-slate-200">{e.key}</span>
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-700"
                      style={{ width: `${ratio * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 w-12 text-right tabular-nums">
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
