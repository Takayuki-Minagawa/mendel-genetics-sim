import { useState, useEffect, useRef, useCallback } from 'react';
import type { Gene, AllelePair, MeiosisStage, Language } from '../types/genetics';
import type { TranslationKeys } from '../i18n/translations';
import { STAGES, stageInfo } from '../data/meiosis';
import { useProgress } from '../progress/useProgress';

interface Props {
  genes: Gene[];
  parent1Alleles: AllelePair[];
  parent2Alleles: AllelePair[];
  t: TranslationKeys;
  lang: Language;
  theme: 'light' | 'dark';
}

const CANVAS_HEIGHT = 320;
// Homolog 0 is drawn as the paternal (blue) copy, homolog 1 as the maternal (red) copy
const HOMOLOG_COLORS = ['#3B82F6', '#EF4444'];
const HOMOLOG_DARK = ['#1D4ED8', '#B91C1C'];

interface Pos {
  x: number;
  y: number;
}
interface ChromatidPos extends Pos {
  len: number;
}
interface Cell extends Pos {
  rx: number;
  ry: number;
}
interface Layout {
  chromatids: Record<string, ChromatidPos>;
  poles: Record<string, Pos>;
  cells: Cell[];
  spindle: number;
  nucleus: number;
  labels: number;
}

const cid = (gi: number, h: number, c: number) => `${gi}-${h}-${c}`;

// Telophase I (two cells side by side) is the widest layout: it needs about 450 * s px
const layoutScale = (w: number) => Math.max(0.5, Math.min(1.35, w / 450));

function computeLayout(stage: MeiosisStage, n: number, w: number, h: number, orientations: boolean[]): Layout {
  const s = layoutScale(w);
  const cx = w / 2;
  const cy = h / 2 + 4;
  const L = (n === 1 ? 66 : 52) * s;
  const lenOf = (gi: number) => L * (gi === 0 ? 1 : 0.72);
  const side = (gi: number, hom: number) => ((hom === 0) !== orientations[gi] ? -1 : 1);
  const slot = (gi: number, hom: number, c: number) => (side(gi, hom) < 0 ? c : 2 + c);
  const stackY = (gi: number, gap: number) => cy + (gi - (n - 1) / 2) * gap;

  const chromatids: Record<string, ChromatidPos> = {};
  const poles: Record<string, Pos> = {};
  let cells: Cell[] = [];
  let spindle = 0;
  let nucleus = 0;
  let labels = 0;

  const one = (x: number, y: number, rx: number, ry: number) => Array.from({ length: 4 }, () => ({ x, y, rx, ry }));
  const halfX = 112 * s;
  const spacing = Math.min(122 * s, (w - 24) / 4);
  const quarterX = (k: number) => cx + (k - 1.5) * spacing;
  const smallR = Math.min(54 * s, spacing * 0.46);

  for (let gi = 0; gi < n; gi++) {
    for (let hom = 0; hom < 2; hom++) {
      for (let c = 0; c < 2; c++) {
        const dc = c === 0 ? -1 : 1;
        const sd = side(gi, hom);
        const gx = cx + (gi - (n - 1) / 2) * 84 * s;
        const len = lenOf(gi);
        let pos: ChromatidPos;
        switch (stage) {
          case 'interphase':
            pos = { x: gx + (hom ? 1 : -1) * 21 * s, y: cy, len };
            break;
          case 'replication':
            pos = { x: gx + (hom ? 1 : -1) * 21 * s + dc * 5 * s, y: cy, len };
            break;
          case 'prophase1':
            pos = { x: gx + (hom ? 1 : -1) * 11 * s + dc * 5 * s, y: cy, len };
            break;
          case 'metaphase1':
            pos = { x: cx + sd * 14 * s + dc * 5 * s, y: stackY(gi, L + 46 * s), len };
            poles[cid(gi, hom, c)] = { x: cx + sd * 150 * s, y: cy };
            break;
          case 'anaphase1':
            pos = { x: cx + sd * 86 * s + dc * 5 * s, y: stackY(gi, L + 46 * s), len };
            poles[cid(gi, hom, c)] = { x: cx + sd * 150 * s, y: cy };
            break;
          case 'telophase1':
          case 'metaphase2':
            pos = { x: cx + sd * halfX + dc * 5 * s, y: stackY(gi, L * 0.9 + 42 * s), len: len * 0.9 };
            if (stage === 'metaphase2') poles[cid(gi, hom, c)] = { x: cx + sd * halfX + dc * 74 * s, y: cy };
            break;
          case 'anaphase2':
            pos = { x: cx + sd * halfX + dc * 46 * s, y: stackY(gi, L * 0.9 + 42 * s), len: len * 0.9 };
            poles[cid(gi, hom, c)] = { x: cx + sd * halfX + dc * 74 * s, y: cy };
            break;
          default:
            // Genes sit side by side inside the small daughter cells
            pos = { x: quarterX(slot(gi, hom, c)) + (gi - (n - 1) / 2) * 24 * s, y: cy + 2 * s, len: len * 0.62 };
        }
        chromatids[cid(gi, hom, c)] = pos;
      }
    }
  }

  switch (stage) {
    case 'interphase':
    case 'replication':
      cells = one(cx, cy, 150 * s, 108 * s);
      nucleus = 1;
      break;
    case 'prophase1':
      cells = one(cx, cy, 150 * s, 108 * s);
      nucleus = 0.35;
      break;
    case 'metaphase1':
      cells = one(cx, cy, 160 * s, 108 * s);
      spindle = 1;
      break;
    case 'anaphase1':
      cells = one(cx, cy, 182 * s, 100 * s);
      spindle = 1;
      break;
    case 'telophase1':
    case 'metaphase2':
      cells = [
        { x: cx - halfX, y: cy, rx: 98 * s, ry: 100 * s },
        { x: cx - halfX, y: cy, rx: 98 * s, ry: 100 * s },
        { x: cx + halfX, y: cy, rx: 98 * s, ry: 100 * s },
        { x: cx + halfX, y: cy, rx: 98 * s, ry: 100 * s },
      ];
      spindle = stage === 'metaphase2' ? 1 : 0;
      break;
    case 'anaphase2':
      cells = [
        { x: cx - halfX, y: cy, rx: 108 * s, ry: 92 * s },
        { x: cx - halfX, y: cy, rx: 108 * s, ry: 92 * s },
        { x: cx + halfX, y: cy, rx: 108 * s, ry: 92 * s },
        { x: cx + halfX, y: cy, rx: 108 * s, ry: 92 * s },
      ];
      spindle = 1;
      break;
    case 'telophase2':
      cells = [0, 1, 2, 3].map((k) => ({ x: quarterX(k), y: cy - 8 * s, rx: smallR, ry: smallR * 1.1 }));
      break;
    case 'gametes':
      cells = [0, 1, 2, 3].map((k) => ({ x: quarterX(k), y: cy - 8 * s, rx: smallR * 0.9, ry: smallR * 0.9 }));
      labels = 1;
      break;
  }

  return { chromatids, poles, cells, spindle, nucleus, labels };
}

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

function lerpLayout(from: Layout, to: Layout, p: number): Layout {
  const chromatids: Record<string, ChromatidPos> = {};
  for (const [id, tp] of Object.entries(to.chromatids)) {
    const fp = from.chromatids[id] ?? tp;
    chromatids[id] = { x: lerp(fp.x, tp.x, p), y: lerp(fp.y, tp.y, p), len: lerp(fp.len, tp.len, p) };
  }
  const poles: Record<string, Pos> = {};
  for (const [id, tp] of Object.entries(to.poles)) {
    const fp = from.poles[id] ?? tp;
    poles[id] = { x: lerp(fp.x, tp.x, p), y: lerp(fp.y, tp.y, p) };
  }
  // Keep fading-out spindle lines anchored to their old poles
  for (const [id, fp] of Object.entries(from.poles)) {
    if (!poles[id]) poles[id] = fp;
  }
  return {
    chromatids,
    poles,
    cells: to.cells.map((tc, i) => {
      const fc = from.cells[i] ?? tc;
      return { x: lerp(fc.x, tc.x, p), y: lerp(fc.y, tc.y, p), rx: lerp(fc.rx, tc.rx, p), ry: lerp(fc.ry, tc.ry, p) };
    }),
    spindle: lerp(from.spindle, to.spindle, p),
    nucleus: lerp(from.nucleus, to.nucleus, p),
    labels: lerp(from.labels, to.labels, p),
  };
}

const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

export default function MeiosisView({ genes, parent1Alleles, parent2Alleles, t, lang, theme }: Props) {
  const { unlock, addXp } = useProgress();
  const [parentIndex, setParentIndex] = useState<0 | 1>(0);
  const parentAlleles = parentIndex === 0 ? parent1Alleles : parent2Alleles;
  const [stageIndex, setStageIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [orientations, setOrientations] = useState<boolean[]>(() => genes.map(() => Math.random() < 0.5));
  const [width, setWidth] = useState(0);
  const [runId, setRunId] = useState(0);
  const [tally, setTally] = useState<Record<string, number>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayRef = useRef<Layout | null>(null);
  const rewardedRun = useRef(-1);
  const configKey = `${genes.map((g) => g.id).join()}|${JSON.stringify(parentAlleles)}`;
  const stage = STAGES[stageIndex];
  const n = Math.max(genes.length, 1);

  // Reset the run when the gene set or the parent changes
  const [prevConfig, setPrevConfig] = useState(configKey);
  if (prevConfig !== configKey) {
    setPrevConfig(configKey);
    setStageIndex(0);
    setPlaying(false);
    setOrientations(genes.map(() => Math.random() < 0.5));
    setRunId((r) => r + 1);
    setTally({});
  }

  const alleleOf = useCallback(
    (gi: number, hom: number) => parentAlleles[gi]?.[hom] ?? '?',
    [parentAlleles]
  );

  const gameteLabels = [0, 1, 2, 3].map((k) =>
    genes
      .map((_, gi) => {
        const leftHom = orientations[gi] ? 1 : 0;
        return alleleOf(gi, k < 2 ? leftHom : 1 - leftHom);
      })
      .join('')
  );

  useEffect(() => {
    if (!playing) return;
    const interval = window.setInterval(() => {
      setStageIndex((i) => {
        if (i < STAGES.length - 1) return i + 1;
        setPlaying(false);
        return i;
      });
    }, 2400 / speed);
    return () => window.clearInterval(interval);
  }, [playing, speed]);

  useEffect(() => {
    if (stageIndex >= STAGES.length - 1) setPlaying(false);
  }, [stageIndex]);

  // Rewards when a run reaches the gamete stage
  useEffect(() => {
    if (stage !== 'gametes' || rewardedRun.current === runId) return;
    rewardedRun.current = runId;
    unlock('meiosisMaster');
    addXp(10, lang === 'ja' ? '減数分裂を観察' : 'Observed meiosis');
    const next = { ...tally };
    gameteLabels.forEach((g) => (next[g] = (next[g] ?? 0) + 1));
    setTally(next);
    if (genes.length === 2 && Object.keys(next).length >= 4) unlock('assortment');
  }, [stage, runId, unlock, addXp, lang, gameteLabels, genes.length, tally]);

  // Track canvas width
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width));
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // Draw (with a tween between stage layouts)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = width;
    const h = CANVAS_HEIGHT;
    if (canvas.width !== Math.round(w * dpr)) canvas.width = Math.round(w * dpr);
    if (canvas.height !== Math.round(h * dpr)) canvas.height = Math.round(h * dpr);
    const isDark = theme === 'dark';
    const s = layoutScale(w);

    const draw = (layout: Layout) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Cells: fills first, then outlines
      const drawn: Cell[] = [];
      const unique = layout.cells.filter((c) => {
        const dup = drawn.some((d) => Math.abs(d.x - c.x) < 0.5 && Math.abs(d.y - c.y) < 0.5 && Math.abs(d.rx - c.rx) < 0.5);
        if (!dup) drawn.push(c);
        return !dup;
      });
      for (const c of unique) {
        const grad = ctx.createRadialGradient(c.x - c.rx * 0.3, c.y - c.ry * 0.3, 4, c.x, c.y, Math.max(c.rx, c.ry));
        grad.addColorStop(0, isDark ? '#1E3A3A' : '#F0FDF4');
        grad.addColorStop(1, isDark ? '#132726' : '#DCFCE7');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isDark ? '#34D399' : '#10B981';
      for (const c of unique) {
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Nuclear envelope
      if (layout.nucleus > 0.01) {
        const c = layout.cells[0];
        ctx.save();
        ctx.globalAlpha = layout.nucleus;
        ctx.setLineDash([6, 5]);
        ctx.strokeStyle = isDark ? '#A78BFA' : '#8B5CF6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.rx * 0.68, c.ry * 0.78, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Spindle fibers
      if (layout.spindle > 0.01) {
        ctx.save();
        ctx.globalAlpha = layout.spindle * 0.6;
        ctx.strokeStyle = isDark ? '#94A3B8' : '#94A3B8';
        ctx.lineWidth = 1;
        const poleSet = new Map<string, Pos>();
        for (const [id, pole] of Object.entries(layout.poles)) {
          const cp = layout.chromatids[id];
          if (!cp) continue;
          ctx.beginPath();
          ctx.moveTo(pole.x, pole.y);
          ctx.lineTo(cp.x, cp.y);
          ctx.stroke();
          poleSet.set(`${Math.round(pole.x)},${Math.round(pole.y)}`, pole);
        }
        ctx.globalAlpha = layout.spindle;
        ctx.fillStyle = '#F59E0B';
        for (const pole of poleSet.values()) {
          ctx.beginPath();
          ctx.arc(pole.x, pole.y, 4.5 * s, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Chromatids
      const chromWidth = 8 * s;
      ctx.lineCap = 'round';
      for (let gi = 0; gi < n; gi++) {
        for (let hom = 0; hom < 2; hom++) {
          const a = layout.chromatids[cid(gi, hom, 0)];
          const b = layout.chromatids[cid(gi, hom, 1)];
          if (!a || !b) continue;
          for (const p of [a, b]) {
            ctx.strokeStyle = HOMOLOG_COLORS[hom];
            ctx.lineWidth = chromWidth;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - p.len / 2);
            ctx.lineTo(p.x, p.y + p.len / 2);
            ctx.stroke();
            // Gene locus band
            ctx.strokeStyle = isDark ? '#FDE68A' : '#FEF3C7';
            ctx.lineWidth = 3 * s;
            ctx.lineCap = 'butt';
            ctx.beginPath();
            ctx.moveTo(p.x - chromWidth / 2, p.y - p.len * 0.25);
            ctx.lineTo(p.x + chromWidth / 2, p.y - p.len * 0.25);
            ctx.stroke();
            ctx.lineCap = 'round';
          }
          const joined = Math.abs(a.x - b.x) < 14 * s && Math.abs(a.y - b.y) < 4;
          if (joined && Math.abs(a.x - b.x) > 1) {
            ctx.fillStyle = HOMOLOG_DARK[hom];
            ctx.beginPath();
            ctx.arc((a.x + b.x) / 2, (a.y + b.y) / 2, 4.5 * s, 0, Math.PI * 2);
            ctx.fill();
          }
          // Allele badges
          const badgeAt = (x: number, y: number) => {
            const r = 10 * s;
            ctx.fillStyle = isDark ? '#0F172A' : '#FFFFFF';
            ctx.strokeStyle = HOMOLOG_COLORS[hom];
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = isDark ? '#F8FAFC' : '#0F172A';
            ctx.font = `bold ${Math.round(12 * s + 1)}px "M PLUS Rounded 1c", system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(alleleOf(gi, hom), x, y + 0.5);
          };
          if (joined) {
            badgeAt((a.x + b.x) / 2, Math.min(a.y, b.y) - a.len / 2 - 13 * s);
          } else {
            badgeAt(a.x, a.y - a.len / 2 - 13 * s);
            badgeAt(b.x, b.y - b.len / 2 - 13 * s);
          }
        }
      }

      // Gamete labels
      if (layout.labels > 0.01) {
        ctx.save();
        ctx.globalAlpha = layout.labels;
        layout.cells.forEach((c, k) => {
          const label = gameteLabels[k];
          const y = c.y + c.ry + 18 * s;
          ctx.font = `800 ${Math.round(14 * s + 2)}px "M PLUS Rounded 1c", system-ui, sans-serif`;
          const tw = ctx.measureText(label).width + 16;
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.roundRect(c.x - tw / 2, y - 12, tw, 24, 12);
          ctx.fill();
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, c.x, y + 1);
        });
        ctx.restore();
      }
    };

    const target = computeLayout(stage, n, w, h, orientations);
    const from = displayRef.current;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!from || reduceMotion) {
      displayRef.current = target;
      draw(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 900 / speed;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const current = lerpLayout(from, target, easeInOut(p));
      displayRef.current = current;
      draw(current);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // gameteLabels is derived from orientations/alleleOf, both listed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, n, width, orientations, alleleOf, theme, speed]);

  const goTo = (i: number) => {
    setStageIndex(Math.max(0, Math.min(STAGES.length - 1, i)));
  };

  const handleAgain = () => {
    setPlaying(false);
    setStageIndex(0);
    setOrientations(genes.map(() => Math.random() < 0.5));
    setRunId((r) => r + 1);
  };

  const handlePlay = () => {
    if (stageIndex === STAGES.length - 1) {
      handleAgain();
      setPlaying(true);
      return;
    }
    setPlaying((p) => !p);
  };

  const info = stageInfo[stage];
  const stageNames = t.meiosis as unknown as Record<string, string>;
  const tallyTotal = Object.values(tally).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">🧬 {t.tabs.meiosis}</h2>
        <div className="flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 p-1 text-sm">
          {([0, 1] as const).map((pi) => (
            <button
              key={pi}
              onClick={() => setParentIndex(pi)}
              className={`px-3 py-1 rounded-full transition-colors ${
                parentIndex === pi
                  ? pi === 0
                    ? 'bg-pink-500 text-white'
                    : 'bg-sky-500 text-white'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {pi === 0 ? t.controls.parent1 : t.controls.parent2} ({(pi === 0 ? parent1Alleles : parent2Alleles).map((p) => p.join('')).join('')})
            </button>
          ))}
        </div>
      </div>

      {/* Stage header + progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="font-bold text-lg text-slate-800 dark:text-slate-100">
            <span className="mr-2">{info.icon}</span>
            {stageNames[stage]}
          </p>
          <span className="text-xs font-mono text-slate-500">
            {stageIndex + 1} / {STAGES.length}
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-500 transition-all duration-500"
            style={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
          style={{ height: `${CANVAS_HEIGHT}px` }}
          aria-label={stageNames[stage]}
        />
        <div className="absolute top-2 left-3 flex gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-1.5 rounded bg-blue-500" />
            {t.meiosis.paternal}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-1.5 rounded bg-red-500" />
            {t.meiosis.maternal}
          </span>
        </div>
      </div>

      {/* Explanation */}
      <div key={stage} className="animate-fade-up rounded-2xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-4">
        {info.law && (
          <span
            className={`inline-block mb-2 px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${
              info.law === 'segregation' ? 'bg-emerald-500' : 'bg-violet-500'
            }`}
          >
            ⭐ {info.law === 'segregation' ? t.learn.segregationLaw : t.learn.independentLaw}
          </span>
        )}
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{info.text[lang]}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => goTo(stageIndex - 1)}
          disabled={stageIndex === 0}
          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700"
          aria-label={t.controls.prev}
        >
          ⏮
        </button>
        <button
          onClick={handlePlay}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-bold shadow hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          {playing ? `⏸ ${t.controls.pause}` : `▶ ${t.controls.start}`}
        </button>
        <button
          onClick={() => goTo(stageIndex + 1)}
          disabled={stageIndex === STAGES.length - 1}
          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700"
          aria-label={t.controls.next}
        >
          ⏭
        </button>
        <button
          onClick={handleAgain}
          className="px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 font-medium hover:bg-amber-200 dark:hover:bg-amber-900/60"
        >
          🔄 {t.meiosis.again}
        </button>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 ml-auto">
          <span>🐢</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-24 accent-emerald-500"
            aria-label={t.controls.speed}
          />
          <span>🐇</span>
        </div>
      </div>

      {/* Stage chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {STAGES.map((st, i) => (
          <button
            key={st}
            onClick={() => {
              setStageIndex(i);
              setPlaying(false);
            }}
            className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
              i === stageIndex
                ? 'bg-emerald-500 text-white'
                : i < stageIndex
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            {stageNames[st]}
          </button>
        ))}
      </div>

      {/* Gamete tally */}
      {tallyTotal > 0 && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
          <h3 className="font-bold text-sm text-amber-700 dark:text-amber-300 mb-1">🥚 {t.meiosis.tallyTitle}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            {genes.length === 2 ? t.meiosis.tallyHintDihybrid : t.meiosis.tallyHint}
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(tally)
              .sort()
              .map(([g, c]) => (
                <span
                  key={g}
                  className="animate-pop-in flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700"
                >
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{g}</span>
                  <span className="text-xs text-slate-500 tabular-nums">
                    ×{c} ({Math.round((c / tallyTotal) * 100)}%)
                  </span>
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
