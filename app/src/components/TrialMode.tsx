import { useState, useMemo, useRef, useEffect } from 'react';
import type { Gene, AllelePair, Language, Offspring } from '../types/genetics';
import { theoreticalRatios, sampleOffspring, phenotypeLabel, phenotypeColor } from '../utils/genetics';
import { fmt, type TranslationKeys } from '../i18n/translations';
import OrganismIcon from './OrganismIcon';
import { useProgress } from '../progress/useProgress';

interface Props {
  genes: Gene[];
  parent1Alleles: AllelePair[];
  parent2Alleles: AllelePair[];
  t: TranslationKeys;
  lang: Language;
  // Mendel's counts, only passed when the current cross matches his experiment
  mendelData?: Record<string, number>;
}

const COUNTS = [10, 100, 1000, 10000];
const GARDEN_SIZE = 60;
const RUN_MS = 1600;

interface RunResult {
  n: number;
  goal: number;
  counts: Record<string, number>;
  history: { n: number; pct: number }[];
  garden: Offspring[];
  prediction: number | null;
  mendel: boolean;
  done: boolean;
}

function ConvergenceChart({
  history,
  theory,
  total,
  color,
  t,
}: {
  history: { n: number; pct: number }[];
  theory: number;
  total: number;
  color: string;
  t: TranslationKeys;
}) {
  const W = 900;
  const H = 240;
  const pad = { l: 44, r: 12, t: 12, b: 28 };
  const maxN = Math.max(total, 10);
  const yMax = Math.min(100, Math.max(theory * 2.2, ...history.map((p) => p.pct)) + 5);
  const x = (n: number) => pad.l + (Math.log10(Math.max(n, 1)) / Math.log10(maxN)) * (W - pad.l - pad.r);
  const y = (pct: number) => pad.t + (1 - pct / yMax) * (H - pad.t - pad.b);
  const path = history.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.n).toFixed(1)},${y(p.pct).toFixed(1)}`).join('');
  const ticks = [1, 10, 100, 1000, 10000].filter((v) => v <= maxN);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={t.trial.convergenceTitle}>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line x1={pad.l} x2={W - pad.r} y1={y(yMax * f)} y2={y(yMax * f)} className="stroke-slate-200 dark:stroke-slate-700" />
          <text x={pad.l - 6} y={y(yMax * f) + 4} textAnchor="end" fontSize="11" className="fill-slate-400">
            {Math.round(yMax * f)}%
          </text>
        </g>
      ))}
      {ticks.map((v) => (
        <text key={v} x={x(v)} y={H - 8} textAnchor="middle" fontSize="11" className="fill-slate-400">
          {v.toLocaleString()}
        </text>
      ))}
      <line
        x1={pad.l}
        x2={W - pad.r}
        y1={y(theory)}
        y2={y(theory)}
        stroke={color}
        strokeWidth="2"
        strokeDasharray="6 5"
        opacity="0.8"
      />
      <text x={W - pad.r} y={y(theory) - 6} textAnchor="end" fontSize="11" fill={color} fontWeight="bold">
        {t.trial.theoreticalRatio} {theory.toFixed(1)}%
      </text>
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      {history.length > 0 && (
        <circle cx={x(history[history.length - 1].n)} cy={y(history[history.length - 1].pct)} r="5" fill={color} />
      )}
    </svg>
  );
}

export default function TrialMode({ genes, parent1Alleles, parent2Alleles, t, lang, mendelData }: Props) {
  const { addXp, unlock, markOnce, state } = useProgress();
  const [count, setCount] = useState(100);
  const [prediction, setPrediction] = useState(50);
  const [locked, setLocked] = useState(false);
  const [run, setRun] = useState<RunResult | null>(null);
  const rafRef = useRef(0);

  const theory = useMemo(
    () => theoreticalRatios(genes, parent1Alleles, parent2Alleles),
    [genes, parent1Alleles, parent2Alleles]
  );
  // Ask about the rarest phenotype: it makes the prediction more interesting
  const target = useMemo(
    () => theory.reduce((min, e) => (e.count < min.count ? e : min), theory[0]),
    [theory]
  );
  const targetPct = (target?.count ?? 0) * 100;
  const mendelTotal = mendelData ? Object.values(mendelData).reduce((a, b) => a + b, 0) : 0;

  const configKey = `${genes.map((g) => g.id).join()}-${JSON.stringify(parent1Alleles)}-${JSON.stringify(parent2Alleles)}`;
  const [prevConfig, setPrevConfig] = useState(configKey);
  if (prevConfig !== configKey) {
    setPrevConfig(configKey);
    setRun(null);
    setLocked(false);
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
  }, [configKey]);

  const finish = (result: RunResult) => {
    // XP is paid once per cross so repeated runs cannot be farmed
    if (markOnce('trialRun', configKey)) addXp(3, t.trial.xpRun);
    if (result.n >= 10000) unlock('bigData');
    if (result.mendel) unlock('mendelReplica');
    setLocked(false);
    if (result.prediction !== null && markOnce('trialPrediction', configKey)) {
      const diff = Math.abs(result.prediction - targetPct);
      if (diff <= 2) {
        unlock('sharpshooter');
        addXp(30, t.trial.xpPrediction);
      } else if (diff <= 5) addXp(20, t.trial.xpPrediction);
      else if (diff <= 10) addXp(10, t.trial.xpPrediction);
    }
  };

  const handleRun = (n: number, mendel = false) => {
    cancelAnimationFrame(rafRef.current);
    const counts: Record<string, number> = {};
    const history: { n: number; pct: number }[] = [];
    const garden: Offspring[] = [];
    const pred = locked ? prediction : null;
    let sampled = 0;
    const start = performance.now();
    const duration = n <= 10 ? 900 : RUN_MS;

    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 2);
      const goal = p >= 1 ? n : Math.max(1, Math.floor(n * eased));
      while (sampled < goal) {
        const child = sampleOffspring(genes, parent1Alleles, parent2Alleles);
        counts[child.key] = (counts[child.key] ?? 0) + 1;
        if (garden.length < GARDEN_SIZE) garden.push(child);
        sampled++;
      }
      history.push({ n: sampled, pct: ((counts[target.key] ?? 0) / sampled) * 100 });
      const result: RunResult = {
        n: sampled,
        goal: n,
        counts: { ...counts },
        history: [...history],
        garden: [...garden],
        prediction: pred,
        mendel,
        done: p >= 1,
      };
      setRun(result);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
      else finish({ ...result, n });
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const running = run !== null && !run.done;
  const targetLabel = target ? phenotypeLabel(genes, target.key, lang) : '';
  const targetColor = target ? phenotypeColor(genes, target.key) : '#6B7280';
  const observedTargetPct = run && run.n > 0 ? ((run.counts[target.key] ?? 0) / run.n) * 100 : 0;

  let verdict: { emoji: string; text: string } | null = null;
  if (run?.done && run.prediction !== null) {
    const diff = Math.abs(run.prediction - targetPct);
    verdict =
      diff <= 2
        ? { emoji: '🎯', text: t.trial.verdictPerfect }
        : diff <= 5
        ? { emoji: '👏', text: t.trial.verdictGreat }
        : diff <= 10
        ? { emoji: '🙂', text: t.trial.verdictClose }
        : { emoji: '🤔', text: t.trial.verdictMiss };
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">🎲 {t.trial.title}</h2>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Step 1: prediction */}
        <div
          className={`rounded-2xl p-4 border-2 transition-colors ${
            locked
              ? 'border-violet-400 bg-violet-50 dark:bg-violet-950/30'
              : 'border-dashed border-violet-300 dark:border-violet-700 bg-white dark:bg-slate-900'
          }`}
        >
          <p className="text-xs font-bold text-violet-500 mb-1">STEP 1</p>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3">🔮 {t.trial.predictTitle}</h3>
          {state.seen.trialPrediction?.includes(configKey) && (
            <p className="-mt-2 mb-3 text-xs text-slate-500 dark:text-slate-400">✔ {t.trial.bonusUsed}</p>
          )}
          {target && (
            <>
              <div className="flex items-center gap-3 mb-3">
                <OrganismIcon genes={genes} phenotypeIds={target.key.split('|')} size={44} className="animate-float" />
                <p className="text-sm text-slate-700 dark:text-slate-200">{fmt(t.trial.predictQuestion, { p: targetLabel })}</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={prediction}
                  disabled={locked || running}
                  onChange={(e) => setPrediction(Number(e.target.value))}
                  className="flex-1 accent-violet-500"
                  aria-label={t.trial.predictTitle}
                />
                <span className="w-16 text-right text-2xl font-black text-violet-600 dark:text-violet-300 tabular-nums">
                  {prediction}%
                </span>
              </div>
              <button
                onClick={() => setLocked((l) => !l)}
                disabled={running}
                className={`mt-3 w-full py-2 rounded-xl text-sm font-bold transition-colors ${
                  locked
                    ? 'bg-violet-200 dark:bg-violet-900 text-violet-800 dark:text-violet-200'
                    : 'bg-violet-500 text-white hover:bg-violet-600'
                }`}
              >
                {locked ? `🔒 ${t.trial.locked}` : t.trial.lockPrediction}
              </button>
            </>
          )}
        </div>

        {/* Step 2: run */}
        <div className="rounded-2xl p-4 border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900">
          <p className="text-xs font-bold text-emerald-500 mb-1">STEP 2</p>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3">🌱 {t.trial.numOffspring}</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {COUNTS.map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                disabled={running}
                className={`px-3 py-1.5 rounded-full text-sm font-bold tabular-nums transition-all ${
                  count === n
                    ? 'bg-emerald-500 text-white shadow scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {n.toLocaleString()}
              </button>
            ))}
          </div>
          <button
            onClick={() => handleRun(count)}
            disabled={running}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-bold text-lg shadow hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:translate-y-0"
          >
            {running ? t.trial.running : `🎲 ${t.trial.run}`}
          </button>
          {mendelData && (
            <button
              onClick={() => handleRun(mendelTotal, true)}
              disabled={running}
              className="mt-2 w-full py-2 rounded-xl border-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-sm font-bold hover:bg-amber-50 dark:hover:bg-amber-950/40 disabled:opacity-60"
            >
              👨‍🔬 {fmt(t.trial.mendelButton, { n: mendelTotal.toLocaleString() })}
            </button>
          )}
        </div>
      </div>

      {run && (
        <div className="flex flex-col gap-5 animate-fade-up">
          {/* Garden */}
          <div className="rounded-2xl bg-gradient-to-b from-sky-50 to-emerald-50 dark:from-slate-900 dark:to-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-4">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-bold text-slate-700 dark:text-slate-200">🌿 {t.trial.garden}</h3>
              <span className="text-sm font-mono text-slate-500 tabular-nums">
                n = {run.n.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {run.garden.map((o, i) => (
                <OrganismIcon key={i} genes={genes} phenotypeIds={o.phenotypeIds} size={28} className="animate-pop-in" />
              ))}
              {run.n > run.garden.length && (
                <span className="self-center ml-2 text-xs text-slate-500">
                  {fmt(t.trial.moreOffspring, { n: (run.n - run.garden.length).toLocaleString() })}
                </span>
              )}
            </div>
          </div>

          {/* Prediction verdict */}
          {verdict && (
            <div className="animate-pop-in rounded-2xl bg-violet-500 text-white p-4 flex items-center gap-4">
              <span className="text-4xl">{verdict.emoji}</span>
              <div className="text-sm">
                <p className="font-bold text-base">{verdict.text}</p>
                <p>
                  {fmt(t.trial.verdictDetail, {
                    p: targetLabel,
                    guess: run.prediction ?? 0,
                    theory: targetPct.toFixed(1),
                    observed: observedTargetPct.toFixed(1),
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Comparison */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3">📊 {t.trial.distribution}</h3>
            <div className="space-y-3">
              {theory.map((e) => {
                const obs = run.n > 0 ? (run.counts[e.key] ?? 0) / run.n : 0;
                const color = phenotypeColor(genes, e.key);
                return (
                  <div key={e.key} className="flex items-center gap-3">
                    <OrganismIcon genes={genes} phenotypeIds={e.key.split('|')} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-slate-700 dark:text-slate-200 truncate">
                          {phenotypeLabel(genes, e.key, lang)}
                        </span>
                        <span className="text-slate-500 tabular-nums">
                          {(run.counts[e.key] ?? 0).toLocaleString()} ({(obs * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <div className="relative h-4 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="absolute inset-y-0 left-0 rounded-full ring-1 ring-inset ring-black/15" style={{ width: `${obs * 100}%`, backgroundColor: color }} />
                        <div
                          className="absolute inset-y-0 w-0.5 bg-slate-900 dark:bg-white"
                          style={{ left: `${e.count * 100}%` }}
                          title={`${t.trial.theoreticalRatio} ${(e.count * 100).toFixed(1)}%`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">▍ = {t.trial.theoreticalRatio}</p>

            {run.mendel && mendelData && run.done && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 dark:text-slate-400 text-xs">
                      <th className="py-1 pr-2">{t.controls.phenotype}</th>
                      <th className="py-1 pr-2 text-right">👨‍🔬 {t.trial.mendelResult}</th>
                      <th className="py-1 text-right">🖥️ {t.trial.yourResult}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {theory.map((e) => (
                      <tr key={e.key} className="border-t border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                        <td className="py-1.5 pr-2">{phenotypeLabel(genes, e.key, lang)}</td>
                        <td className="py-1.5 pr-2 text-right tabular-nums">{(mendelData[e.key] ?? 0).toLocaleString()}</td>
                        <td className="py-1.5 text-right tabular-nums">{(run.counts[e.key] ?? 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">💡 {t.trial.mendelNote}</p>
              </div>
            )}
          </div>

          {/* Convergence */}
          {target && (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="font-bold text-slate-700 dark:text-slate-200">📈 {t.trial.convergenceTitle}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{fmt(t.trial.convergenceHint, { p: targetLabel })}</p>
              <ConvergenceChart history={run.history} theory={targetPct} total={run.goal} color={targetColor} t={t} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
