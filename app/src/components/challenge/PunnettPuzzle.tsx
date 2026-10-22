import { useState, useMemo } from 'react';
import type { Gene, AllelePair, Language } from '../../types/genetics';
import { peaSeedColorGene, peaSeedShapeGene, flowerColorGene, bloodTypeGene } from '../../data/presets';
import {
  generatePunnettSquare,
  gameteLabel,
  possibleGenotypes,
  genotypeString,
  randomItem,
  shuffle,
  isHomozygous,
} from '../../utils/genetics';
import { fmt, type TranslationKeys } from '../../i18n/translations';
import { useProgress } from '../../progress/useProgress';

interface Props {
  t: TranslationKeys;
  lang: Language;
}

type Level = 'easy' | 'normal' | 'hard';

interface Problem {
  genes: Gene[];
  p1: AllelePair[];
  p2: AllelePair[];
  blanks: number[];
}

const LEVEL_XP: Record<Level, number> = { easy: 15, normal: 25, hard: 40 };

function randomParent(gene: Gene, preferHetero: boolean): AllelePair {
  const options = possibleGenotypes(gene);
  const hetero = options.filter((p) => !isHomozygous(p));
  return preferHetero && hetero.length > 0 && Math.random() < 0.7 ? randomItem(hetero) : randomItem(options);
}

function newProblem(level: Level): Problem {
  let genes: Gene[];
  if (level === 'easy') genes = [randomItem([peaSeedColorGene, peaSeedShapeGene, flowerColorGene])];
  else if (level === 'normal') genes = [randomItem([peaSeedColorGene, flowerColorGene, bloodTypeGene])];
  else genes = [peaSeedColorGene, peaSeedShapeGene];
  const p1 = genes.map((g) => randomParent(g, true));
  const p2 = genes.map((g) => randomParent(g, true));
  const cells = genes.length === 1 ? 4 : 16;
  const blankCount = level === 'easy' ? 2 : level === 'normal' ? 4 : 6;
  const blanks = shuffle(Array.from({ length: cells }, (_, i) => i)).slice(0, blankCount).sort((a, b) => a - b);
  return { genes, p1, p2, blanks };
}

function allGenotypeOptions(genes: Gene[]): string[] {
  let combos: AllelePair[][] = [[]];
  for (const g of genes) {
    combos = combos.flatMap((c) => possibleGenotypes(g, true).map((p) => [...c, p]));
  }
  return combos.map(genotypeString);
}

export default function PunnettPuzzle({ t }: Props) {
  const { addXp, unlock, celebrate } = useProgress();
  const [level, setLevel] = useState<Level>('easy');
  const [problem, setProblem] = useState<Problem>(() => newProblem('easy'));
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [active, setActive] = useState<number | null>(problem.blanks[0]);
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const punnett = useMemo(
    () => generatePunnettSquare(problem.genes, problem.p1, problem.p2, false),
    [problem]
  );
  const options = useMemo(() => allGenotypeOptions(problem.genes), [problem.genes]);
  const cols = punnett.fatherGametes.length;
  const cellAt = (idx: number) => punnett.grid[Math.floor(idx / cols)][idx % cols];
  const allFilled = problem.blanks.every((b) => answers[b]);
  const wrongCount = problem.blanks.filter((b) => answers[b] !== cellAt(b).genotype).length;

  const start = (lv: Level) => {
    const p = newProblem(lv);
    setLevel(lv);
    setProblem(p);
    setAnswers({});
    setActive(p.blanks[0]);
    setChecked(false);
    setSolved(false);
  };

  const choose = (genotype: string) => {
    if (active === null || solved) return;
    const next = { ...answers, [active]: genotype };
    setAnswers(next);
    setChecked(false);
    const nextBlank = problem.blanks.find((b) => !next[b]);
    setActive(nextBlank ?? null);
  };

  const check = () => {
    setChecked(true);
    if (wrongCount === 0) {
      setSolved(true);
      celebrate();
      addXp(LEVEL_XP[level], t.puzzle.xp);
      unlock('puzzleSolver');
      if (level === 'hard') unlock('puzzleHard');
    } else {
      setShakeKey((k) => k + 1);
      setActive(problem.blanks.find((b) => answers[b] !== cellAt(b).genotype) ?? null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {(['easy', 'normal', 'hard'] as Level[]).map((lv) => (
          <button
            key={lv}
            onClick={() => start(lv)}
            className={`px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
              level === lv
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {lv === 'easy' ? '⭐' : lv === 'normal' ? '⭐⭐' : '⭐⭐⭐'} {t.puzzle[lv]}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-700 dark:text-slate-200">
        {fmt(t.puzzle.instruction, { p1: genotypeString(problem.p1), p2: genotypeString(problem.p2) })}
      </p>

      <div className="overflow-x-auto">
        <table key={shakeKey} className={`border-separate border-spacing-1 mx-auto ${shakeKey > 0 && !solved ? 'animate-shake' : ''}`}>
          <thead>
            <tr>
              <th className="text-xs text-slate-400 p-1">♀\♂</th>
              {punnett.fatherGametes.map((g, j) => (
                <th key={j} className="p-1">
                  <span className="inline-flex items-center justify-center min-w-10 h-9 px-2 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-200 font-mono font-bold text-sm">
                    {gameteLabel(g)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {punnett.motherGametes.map((g, i) => (
              <tr key={i}>
                <th className="p-1">
                  <span className="inline-flex items-center justify-center min-w-10 h-9 px-2 rounded-full bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-200 font-mono font-bold text-sm">
                    {gameteLabel(g)}
                  </span>
                </th>
                {punnett.grid[i].map((cell, j) => {
                  const idx = i * cols + j;
                  const isBlank = problem.blanks.includes(idx);
                  const value = answers[idx];
                  const isWrong = checked && isBlank && value !== cell.genotype;
                  const isRight = (checked || solved) && isBlank && value === cell.genotype;
                  return (
                    <td key={j}>
                      {isBlank ? (
                        <button
                          onClick={() => !solved && setActive(idx)}
                          className={`w-16 sm:w-20 h-12 rounded-xl font-mono font-bold border-2 transition-all ${
                            isRight
                              ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-500 text-emerald-700 dark:text-emerald-200'
                              : isWrong
                              ? 'bg-rose-100 dark:bg-rose-900/50 border-rose-500 text-rose-700 dark:text-rose-200'
                              : active === idx
                              ? 'bg-amber-50 dark:bg-amber-900/40 border-amber-400 ring-4 ring-amber-200 dark:ring-amber-700 text-slate-800 dark:text-slate-100'
                              : 'bg-white dark:bg-slate-900 border-dashed border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {value ?? '?'}
                        </button>
                      ) : (
                        <div className="w-16 sm:w-20 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-mono text-sm font-bold text-slate-500 dark:text-slate-400">
                          {cell.genotype}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!solved && (
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t.puzzle.pickHint}</p>
          <div className="flex flex-wrap gap-2">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => choose(o)}
                disabled={active === null}
                className="px-3 py-1.5 rounded-lg font-mono font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-400 disabled:opacity-40 transition-colors"
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {!solved && (
          <button
            onClick={check}
            disabled={!allFilled}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow disabled:opacity-40"
          >
            ✅ {t.puzzle.check}
          </button>
        )}
        {checked && !solved && <p className="text-sm text-rose-600 dark:text-rose-400 font-bold">{fmt(t.puzzle.wrong, { n: wrongCount })}</p>}
        {solved && (
          <>
            <p className="text-emerald-600 dark:text-emerald-400 font-black text-lg animate-pop-in">🎉 {t.puzzle.solved}</p>
            <button
              onClick={() => start(level)}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600"
            >
              {t.puzzle.next} →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
