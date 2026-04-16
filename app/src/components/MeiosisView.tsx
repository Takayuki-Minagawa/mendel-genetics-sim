import { useState, useEffect, useRef, useCallback } from 'react';
import type { Gene, AllelePair, MeiosisStage } from '../types/genetics';
import type { TranslationKeys } from '../i18n/translations';

interface Props {
  genes: Gene[];
  parentAlleles: AllelePair[];
  t: TranslationKeys;
}

const STAGES: MeiosisStage[] = [
  'interphase',
  'replication',
  'prophase1',
  'metaphase1',
  'anaphase1',
  'telophase1',
  'metaphase2',
  'anaphase2',
  'telophase2',
  'gametes',
];

const CHROMOSOME_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B'];

export default function MeiosisView({ genes, parentAlleles, t }: Props) {
  const [stageIndex, setStageIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [orientations, setOrientations] = useState<boolean[]>(() =>
    genes.map(() => Math.random() < 0.5)
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);

  const stage = STAGES[stageIndex];

  // Get alleles for a gene, respecting random orientation for independent assortment
  const getOrientedAlleles = useCallback((geneIndex: number): [string, string] => {
    const pair = parentAlleles[geneIndex];
    const a1 = pair?.[0] || '?';
    const a2 = pair?.[1] || '?';
    if (orientations[geneIndex]) return [a2, a1];
    return [a1, a2];
  }, [parentAlleles, orientations]);

  const nextStage = useCallback(() => {
    setStageIndex((i) => {
      if (i < STAGES.length - 1) return i + 1;
      setPlaying(false);
      return i;
    });
    progressRef.current = 0;
  }, []);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(nextStage, 2000 / speed);
    return () => clearInterval(interval);
  }, [playing, speed, nextStage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    const drawChromosome = (
      x: number,
      y: number,
      length: number,
      color: string,
      label: string,
      doubled: boolean = false
    ) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      if (doubled) {
        ctx.beginPath();
        ctx.moveTo(x - 3, y - length / 2);
        ctx.lineTo(x - 3, y + length / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 3, y - length / 2);
        ctx.lineTo(x + 3, y + length / 2);
        ctx.stroke();
        // Centromere
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(x, y - length / 2);
        ctx.lineTo(x, y + length / 2);
        ctx.stroke();
      }

      ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#1F2937';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y + length / 2 + 16);
    };

    const drawCell = (cx: number, cy: number, rx: number, ry: number) => {
      ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#6B7280' : '#9CA3AF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    };

    const numGenes = Math.max(genes.length, 1);
    const chromLen = Math.min(40, 80 / numGenes);

    if (stage === 'interphase') {
      drawCell(w / 2, h / 2, 100, 80);
      for (let i = 0; i < numGenes; i++) {
        const xOff = (i - (numGenes - 1) / 2) * 50;
        const color = CHROMOSOME_COLORS[i % CHROMOSOME_COLORS.length];
        const a1 = parentAlleles[i]?.[0] || '?';
        const a2 = parentAlleles[i]?.[1] || '?';
        drawChromosome(w / 2 + xOff - 12, h / 2, chromLen, color, a1, false);
        drawChromosome(w / 2 + xOff + 12, h / 2, chromLen, color, a2, false);
      }
    } else if (stage === 'replication') {
      drawCell(w / 2, h / 2, 110, 90);
      for (let i = 0; i < numGenes; i++) {
        const xOff = (i - (numGenes - 1) / 2) * 60;
        const color = CHROMOSOME_COLORS[i % CHROMOSOME_COLORS.length];
        const a1 = parentAlleles[i]?.[0] || '?';
        const a2 = parentAlleles[i]?.[1] || '?';
        drawChromosome(w / 2 + xOff - 15, h / 2, chromLen, color, a1, true);
        drawChromosome(w / 2 + xOff + 15, h / 2, chromLen, color, a2, true);
      }
    } else if (stage === 'prophase1') {
      drawCell(w / 2, h / 2, 110, 90);
      for (let i = 0; i < numGenes; i++) {
        const xOff = (i - (numGenes - 1) / 2) * 50;
        const color = CHROMOSOME_COLORS[i % CHROMOSOME_COLORS.length];
        const a1 = parentAlleles[i]?.[0] || '?';
        const a2 = parentAlleles[i]?.[1] || '?';
        drawChromosome(w / 2 + xOff - 5, h / 2, chromLen, color, a1, true);
        drawChromosome(w / 2 + xOff + 5, h / 2, chromLen, a2 === a1 ? color : color + '99', a2, true);
      }
      // Show pairing lines
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 1;
      for (let i = 0; i < numGenes; i++) {
        const xOff = (i - (numGenes - 1) / 2) * 50;
        ctx.beginPath();
        ctx.moveTo(w / 2 + xOff - 10, h / 2 - chromLen / 3);
        ctx.lineTo(w / 2 + xOff + 10, h / 2 - chromLen / 3);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    } else if (stage === 'metaphase1') {
      drawCell(w / 2, h / 2, 110, 90);
      // Chromosomes line up at metaphase plate
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = '#9CA3AF55';
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2 - 80);
      ctx.lineTo(w / 2, h / 2 + 80);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < numGenes; i++) {
        const yOff = (i - (numGenes - 1) / 2) * (chromLen + 20);
        const color = CHROMOSOME_COLORS[i % CHROMOSOME_COLORS.length];
        const [left, right] = getOrientedAlleles(i);
        drawChromosome(w / 2 - 18, h / 2 + yOff, chromLen, color, left, true);
        drawChromosome(w / 2 + 18, h / 2 + yOff, chromLen, color, right, true);
      }
    } else if (stage === 'anaphase1') {
      drawCell(w / 2, h / 2, 120, 90);
      for (let i = 0; i < numGenes; i++) {
        const yOff = (i - (numGenes - 1) / 2) * (chromLen + 20);
        const color = CHROMOSOME_COLORS[i % CHROMOSOME_COLORS.length];
        const [left, right] = getOrientedAlleles(i);
        drawChromosome(w / 2 - 50, h / 2 + yOff, chromLen, color, left, true);
        drawChromosome(w / 2 + 50, h / 2 + yOff, chromLen, color, right, true);
      }
      // Arrows
      ctx.fillStyle = '#9CA3AF';
      ctx.beginPath();
      ctx.moveTo(w / 2 - 30, h / 2);
      ctx.lineTo(w / 2 - 35, h / 2 - 5);
      ctx.lineTo(w / 2 - 35, h / 2 + 5);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w / 2 + 30, h / 2);
      ctx.lineTo(w / 2 + 35, h / 2 - 5);
      ctx.lineTo(w / 2 + 35, h / 2 + 5);
      ctx.fill();
    } else if (stage === 'telophase1') {
      drawCell(w / 2 - 60, h / 2, 55, 70);
      drawCell(w / 2 + 60, h / 2, 55, 70);
      for (let i = 0; i < numGenes; i++) {
        const yOff = (i - (numGenes - 1) / 2) * (chromLen + 15);
        const color = CHROMOSOME_COLORS[i % CHROMOSOME_COLORS.length];
        const [left, right] = getOrientedAlleles(i);
        drawChromosome(w / 2 - 60, h / 2 + yOff, chromLen * 0.8, color, left, true);
        drawChromosome(w / 2 + 60, h / 2 + yOff, chromLen * 0.8, color, right, true);
      }
    } else if (stage === 'metaphase2') {
      drawCell(w / 2 - 70, h / 2, 50, 65);
      drawCell(w / 2 + 70, h / 2, 50, 65);
      for (let i = 0; i < numGenes; i++) {
        const yOff = (i - (numGenes - 1) / 2) * (chromLen + 15);
        const color = CHROMOSOME_COLORS[i % CHROMOSOME_COLORS.length];
        const [left, right] = getOrientedAlleles(i);
        drawChromosome(w / 2 - 70, h / 2 + yOff, chromLen * 0.8, color, left, true);
        drawChromosome(w / 2 + 70, h / 2 + yOff, chromLen * 0.8, color, right, true);
      }
    } else if (stage === 'anaphase2') {
      drawCell(w / 2 - 80, h / 2, 50, 65);
      drawCell(w / 2 + 80, h / 2, 50, 65);
      for (let i = 0; i < numGenes; i++) {
        const yOff = (i - (numGenes - 1) / 2) * (chromLen + 15);
        const color = CHROMOSOME_COLORS[i % CHROMOSOME_COLORS.length];
        const [left, right] = getOrientedAlleles(i);
        // Left cell splits
        drawChromosome(w / 2 - 95, h / 2 + yOff, chromLen * 0.7, color, left, false);
        drawChromosome(w / 2 - 65, h / 2 + yOff, chromLen * 0.7, color, left, false);
        // Right cell splits
        drawChromosome(w / 2 + 65, h / 2 + yOff, chromLen * 0.7, color, right, false);
        drawChromosome(w / 2 + 95, h / 2 + yOff, chromLen * 0.7, color, right, false);
      }
    } else if (stage === 'telophase2') {
      drawCell(w / 2 - 100, h / 2, 35, 50);
      drawCell(w / 2 - 50, h / 2, 35, 50);
      drawCell(w / 2 + 50, h / 2, 35, 50);
      drawCell(w / 2 + 100, h / 2, 35, 50);
      for (let i = 0; i < numGenes; i++) {
        const yOff = (i - (numGenes - 1) / 2) * (chromLen + 10);
        const color = CHROMOSOME_COLORS[i % CHROMOSOME_COLORS.length];
        const [left, right] = getOrientedAlleles(i);
        drawChromosome(w / 2 - 100, h / 2 + yOff, chromLen * 0.6, color, left, false);
        drawChromosome(w / 2 - 50, h / 2 + yOff, chromLen * 0.6, color, left, false);
        drawChromosome(w / 2 + 50, h / 2 + yOff, chromLen * 0.6, color, right, false);
        drawChromosome(w / 2 + 100, h / 2 + yOff, chromLen * 0.6, color, right, false);
      }
    } else if (stage === 'gametes') {
      const positions = [
        { x: w / 2 - 100, y: h / 2 },
        { x: w / 2 - 35, y: h / 2 },
        { x: w / 2 + 35, y: h / 2 },
        { x: w / 2 + 100, y: h / 2 },
      ];
      positions.forEach((pos) => {
        drawCell(pos.x, pos.y, 30, 30);
      });

      for (let i = 0; i < numGenes; i++) {
        const yOff = (i - (numGenes - 1) / 2) * (chromLen * 0.6 + 8);
        const color = CHROMOSOME_COLORS[i % CHROMOSOME_COLORS.length];
        const [left, right] = getOrientedAlleles(i);
        drawChromosome(positions[0].x, positions[0].y + yOff, chromLen * 0.5, color, left, false);
        drawChromosome(positions[1].x, positions[1].y + yOff, chromLen * 0.5, color, left, false);
        drawChromosome(positions[2].x, positions[2].y + yOff, chromLen * 0.5, color, right, false);
        drawChromosome(positions[3].x, positions[3].y + yOff, chromLen * 0.5, color, right, false);
      }

      // Labels
      ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#374151';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      for (let gi = 0; gi < 4; gi++) {
        const alleles = genes.map((_, i) => {
          const [left, right] = getOrientedAlleles(i);
          return gi < 2 ? left : right;
        });
        ctx.fillText(alleles.join(''), positions[gi].x, positions[gi].y + 45);
      }
    }

    // Stage label
    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#F3F4F6' : '#111827';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((t.meiosis as Record<string, string>)[stage], w / 2, 25);
  }, [stage, genes, parentAlleles, orientations, getOrientedAlleles, t]);

  // Re-randomize orientations when genes change
  useEffect(() => {
    setOrientations(genes.map(() => Math.random() < 0.5));
  }, [genes]);

  const handleReset = () => {
    setStageIndex(0);
    setPlaying(false);
    progressRef.current = 0;
    setOrientations(genes.map(() => Math.random() < 0.5));
  };

  return (
    <div className="flex flex-col gap-4">
      <canvas
        ref={canvasRef}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        style={{ height: '300px' }}
      />
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
        {t.meiosis.description}
      </p>

      {/* Stage indicators */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {STAGES.map((s, i) => (
          <button
            key={s}
            onClick={() => {
              setStageIndex(i);
              setPlaying(false);
            }}
            className={`px-2 py-1 text-xs rounded whitespace-nowrap transition-colors ${
              i === stageIndex
                ? 'bg-blue-500 text-white'
                : i < stageIndex
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}
          >
            {(t.meiosis as Record<string, string>)[s]}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setPlaying(!playing)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          {playing ? t.controls.pause : t.controls.start}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
        >
          {t.controls.reset}
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>{t.controls.slow}</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-20"
          />
          <span>{t.controls.fast}</span>
        </div>
      </div>
    </div>
  );
}
