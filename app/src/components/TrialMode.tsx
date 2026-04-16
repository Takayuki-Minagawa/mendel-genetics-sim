import { useState, useMemo, useRef, useEffect } from 'react';
import type { Gene, AllelePair } from '../types/genetics';
import { runTrial, generatePunnettSquare } from '../utils/genetics';
import type { TranslationKeys } from '../i18n/translations';

interface Props {
  genes: Gene[];
  parent1Alleles: AllelePair[];
  parent2Alleles: AllelePair[];
  t: TranslationKeys;
}

export default function TrialMode({ genes, parent1Alleles, parent2Alleles, t }: Props) {
  const [count, setCount] = useState(100);
  const [results, setResults] = useState<{ phenotype: string; colors: string[] }[] | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const theoretical = useMemo(
    () => generatePunnettSquare(genes, parent1Alleles, parent2Alleles).phenotypeRatios,
    [genes, parent1Alleles, parent2Alleles]
  );

  const observed = useMemo(() => {
    if (!results) return {};
    const counts: Record<string, number> = {};
    results.forEach((r) => {
      counts[r.phenotype] = (counts[r.phenotype] || 0) + 1;
    });
    const ratios: Record<string, number> = {};
    for (const [k, v] of Object.entries(counts)) {
      ratios[k] = v / results.length;
    }
    return ratios;
  }, [results]);

  const phenotypeColors = useMemo(() => {
    const map: Record<string, string> = {};
    if (results) {
      results.forEach((r) => {
        if (!map[r.phenotype]) {
          map[r.phenotype] = r.colors[0] || '#6B7280';
        }
      });
    }
    // Also add from theoretical
    for (const pt of Object.keys(theoretical)) {
      if (!map[pt]) {
        for (const gene of genes) {
          for (const [phenoName, color] of Object.entries(gene.phenotypeColorMap)) {
            if (pt.includes(phenoName)) {
              map[pt] = color;
            }
          }
        }
      }
    }
    return map;
  }, [results, theoretical, genes]);

  const handleRun = () => {
    const res = runTrial(genes, parent1Alleles, parent2Alleles, count);
    setResults(res);
  };

  // Draw histogram
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !results) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;
    const isDark = document.documentElement.classList.contains('dark');

    ctx.clearRect(0, 0, w, h);

    const allPhenotypes = Array.from(
      new Set([...Object.keys(theoretical), ...Object.keys(observed)])
    );
    const n = allPhenotypes.length;
    if (n === 0) return;

    const padding = { top: 30, bottom: 50, left: 50, right: 20 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const groupWidth = chartW / n;
    const barWidth = groupWidth * 0.35;

    // Y axis
    const maxVal = Math.max(
      ...Object.values(theoretical),
      ...Object.values(observed),
      0.01
    );

    // Grid lines
    ctx.strokeStyle = isDark ? '#374151' : '#E5E7EB';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + chartH - (chartH * i) / 4;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.fillStyle = isDark ? '#9CA3AF' : '#6B7280';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(((maxVal * i) / 4 * 100).toFixed(0) + '%', padding.left - 5, y + 4);
    }

    allPhenotypes.forEach((pt, i) => {
      const x = padding.left + groupWidth * i + groupWidth / 2;
      const theoVal = theoretical[pt] || 0;
      const obsVal = observed[pt] || 0;
      const color = phenotypeColors[pt] || '#6B7280';

      // Theoretical bar
      const theoH = (theoVal / maxVal) * chartH;
      ctx.fillStyle = color + '66';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.fillRect(x - barWidth - 2, padding.top + chartH - theoH, barWidth, theoH);
      ctx.strokeRect(x - barWidth - 2, padding.top + chartH - theoH, barWidth, theoH);

      // Observed bar
      const obsH = (obsVal / maxVal) * chartH;
      ctx.fillStyle = color;
      ctx.fillRect(x + 2, padding.top + chartH - obsH, barWidth, obsH);

      // Label
      ctx.fillStyle = isDark ? '#D1D5DB' : '#374151';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pt, x, h - padding.bottom + 15);

      // Values
      ctx.font = '10px sans-serif';
      ctx.fillStyle = isDark ? '#9CA3AF' : '#6B7280';
      if (theoH > 15) {
        ctx.fillText(
          (theoVal * 100).toFixed(1) + '%',
          x - barWidth / 2 - 2,
          padding.top + chartH - theoH - 5
        );
      }
      if (obsH > 15) {
        ctx.fillText(
          (obsVal * 100).toFixed(1) + '%',
          x + barWidth / 2 + 2,
          padding.top + chartH - obsH - 5
        );
      }
    });

    // Legend
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#6B728066';
    ctx.fillRect(w - 160, 8, 12, 12);
    ctx.strokeStyle = '#6B7280';
    ctx.strokeRect(w - 160, 8, 12, 12);
    ctx.fillStyle = isDark ? '#D1D5DB' : '#374151';
    ctx.textAlign = 'left';
    ctx.fillText(t.trial.theoreticalRatio, w - 143, 18);

    ctx.fillStyle = '#6B7280';
    ctx.fillRect(w - 160, 25, 12, 12);
    ctx.fillStyle = isDark ? '#D1D5DB' : '#374151';
    ctx.fillText(t.trial.observedRatio, w - 143, 35);
  }, [results, observed, theoretical, phenotypeColors, t]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t.trial.numOffspring}:
        </label>
        <select
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm"
        >
          {[10, 50, 100, 500, 1000, 5000, 10000].map((n) => (
            <option key={n} value={n}>
              {n.toLocaleString()}
            </option>
          ))}
        </select>
        <button
          onClick={handleRun}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
        >
          {t.trial.run}
        </button>
      </div>

      {results && (
        <>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            {t.trial.distribution} (n={results.length.toLocaleString()})
          </h3>
          <canvas
            ref={canvasRef}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            style={{ height: '280px' }}
          />

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-left text-gray-700 dark:text-gray-300">
                    {t.controls.phenotype}
                  </th>
                  <th className="p-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-right text-gray-700 dark:text-gray-300">
                    {t.trial.theoreticalRatio}
                  </th>
                  <th className="p-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-right text-gray-700 dark:text-gray-300">
                    {t.trial.observedRatio}
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(theoretical).map((pt) => (
                  <tr key={pt}>
                    <td className="p-2 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                      <span
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: phenotypeColors[pt] }}
                      />
                      {pt}
                    </td>
                    <td className="p-2 border border-gray-300 dark:border-gray-600 text-right text-gray-600 dark:text-gray-400">
                      {((theoretical[pt] || 0) * 100).toFixed(1)}%
                    </td>
                    <td className="p-2 border border-gray-300 dark:border-gray-600 text-right text-gray-600 dark:text-gray-400">
                      {((observed[pt] || 0) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
