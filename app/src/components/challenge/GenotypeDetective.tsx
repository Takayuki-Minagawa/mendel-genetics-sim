import { useState } from 'react';
import type { Gene, AllelePair, Language, Offspring } from '../../types/genetics';
import { peaSeedColorGene, peaSeedShapeGene, bloodTypeGene } from '../../data/presets';
import { getPhenotype, sampleOffspring, randomItem } from '../../utils/genetics';
import { fmt, type TranslationKeys } from '../../i18n/translations';
import OrganismIcon from '../OrganismIcon';
import { useProgress } from '../../progress/useProgress';

interface Props {
  t: TranslationKeys;
  lang: Language;
}

interface Case {
  gene: Gene;
  homo: AllelePair;
  het: AllelePair;
  tester: AllelePair;
  hidden: AllelePair;
}

const OFFSPRING_PER_CROSS = 4;

function newCase(): Case {
  const options: { gene: Gene; dominant: string; recessive: string }[] = [
    { gene: peaSeedColorGene, dominant: 'Y', recessive: 'y' },
    { gene: peaSeedShapeGene, dominant: 'R', recessive: 'r' },
    { gene: bloodTypeGene, dominant: 'A', recessive: 'O' },
    { gene: bloodTypeGene, dominant: 'B', recessive: 'O' },
  ];
  const pick = randomItem(options);
  const homo: AllelePair = [pick.dominant, pick.dominant];
  const het: AllelePair = [pick.dominant, pick.recessive];
  return {
    gene: pick.gene,
    homo,
    het,
    tester: [pick.recessive, pick.recessive],
    hidden: Math.random() < 0.5 ? homo : het,
  };
}

export default function GenotypeDetective({ t, lang }: Props) {
  const { addXp, unlock, bump } = useProgress();
  const [caseNo, setCaseNo] = useState(1);
  const [current, setCurrent] = useState<Case>(newCase);
  const [crosses, setCrosses] = useState<Offspring[][]>([]);
  const [guess, setGuess] = useState<AllelePair | null>(null);

  const { gene, homo, het, tester, hidden } = current;
  const genes = [gene];
  const domPheno = getPhenotype(gene, homo);
  const recPheno = getPhenotype(gene, tester);
  const all = crosses.flat();
  const sawRecessive = all.some((o) => o.phenotypeIds[0] === recPheno.id);
  const chanceIfHet = Math.pow(0.5, all.length) * 100;
  const solved = guess !== null;
  const correct = solved && guess[0] === hidden[0] && guess[1] === hidden[1];
  const hiddenIsHet = hidden[1] !== hidden[0];

  const doCross = () => {
    const kids = Array.from({ length: OFFSPRING_PER_CROSS }, () => sampleOffspring(genes, [hidden], [tester]));
    setCrosses((c) => [...c, kids]);
  };

  const handleGuess = (pair: AllelePair) => {
    setGuess(pair);
    const isRight = pair[0] === hidden[0] && pair[1] === hidden[1];
    if (!isRight) return;
    const solid = hiddenIsHet ? sawRecessive : all.length >= 8;
    addXp(solid ? 25 : 10, solid ? t.detective.xpSolid : t.detective.xpLucky);
    unlock('detective');
    if (bump('detectiveSolved') >= 5) unlock('detectivePro');
  };

  const nextCase = () => {
    setCurrent(newCase());
    setCrosses([]);
    setGuess(null);
    setCaseNo((n) => n + 1);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs tracking-widest text-slate-500">CASE FILE #{String(caseNo).padStart(3, '0')}</p>
      </div>

      <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
        {/* Suspect */}
        <div className="rounded-2xl bg-slate-800 text-white p-4 flex items-center gap-4 relative overflow-hidden">
          <div className="relative shrink-0">
            <OrganismIcon genes={genes} phenotypeIds={[domPheno.id]} size={72} className="animate-float" />
            <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-slate-900 font-black flex items-center justify-center shadow">
              ?
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-300">{t.detective.suspect}</p>
            <p className="font-bold">{fmt(t.detective.question, { p: domPheno.name[lang], trait: gene.name[lang] })}</p>
            <p className="font-mono text-lg mt-1">
              {homo.join('')} <span className="text-slate-400 text-sm">{t.detective.or}</span> {het.join('')} ?
            </p>
          </div>
        </div>
        <div className="text-center text-2xl font-black text-slate-400">×</div>
        {/* Tester */}
        <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-4 flex items-center gap-4">
          <OrganismIcon genes={genes} phenotypeIds={[recPheno.id]} size={60} />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.detective.tester}</p>
            <p className="font-bold text-slate-800 dark:text-slate-100">
              {recPheno.name[lang]} <span className="font-mono">({tester.join('')})</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.detective.testerHint}</p>
          </div>
        </div>
      </div>

      <button
        onClick={doCross}
        disabled={solved}
        className="self-start px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold shadow hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
      >
        🔬 {fmt(t.detective.crossButton, { n: OFFSPRING_PER_CROSS })}
      </button>

      {crosses.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-3 space-y-2">
          {crosses.map((kids, ci) => (
            <div key={ci} className="flex items-center gap-2">
              <span className="text-xs text-slate-500 w-12 shrink-0">#{ci + 1}</span>
              {kids.map((k, ki) => (
                <div key={ki} className="flex flex-col items-center animate-pop-in" style={{ animationDelay: `${ki * 90}ms` }}>
                  <OrganismIcon genes={genes} phenotypeIds={k.phenotypeIds} size={36} />
                  {solved && <span className="text-[10px] font-mono text-slate-500">{k.genotype}</span>}
                </div>
              ))}
            </div>
          ))}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-sm">
            {sawRecessive ? (
              <p className="text-emerald-700 dark:text-emerald-300 font-bold">💡 {fmt(t.detective.clueRecessive, { p: recPheno.name[lang], r: tester[0] })}</p>
            ) : (
              <div>
                <p className="text-slate-600 dark:text-slate-300">
                  {fmt(t.detective.clueChance, { n: all.length, p: domPheno.name[lang], het: het.join(''), pct: chanceIfHet < 1 ? chanceIfHet.toFixed(2) : chanceIfHet.toFixed(1) })}
                </p>
                <div className="mt-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${chanceIfHet}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!solved ? (
        <div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">🕵️ {t.detective.accuse}</p>
          {crosses.length === 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t.detective.needEvidence}</p>
          )}
          <div className="flex gap-3">
            {[homo, het].map((pair) => (
              <button
                key={pair.join('')}
                onClick={() => handleGuess(pair)}
                disabled={crosses.length === 0}
                className="flex-1 py-3 rounded-xl border-2 border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 font-mono text-2xl font-black text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                {pair.join('')}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div
          className={`rounded-2xl p-4 text-white ${correct ? 'bg-emerald-500 animate-pop-in' : 'bg-rose-500 animate-shake'}`}
        >
          <p className="text-lg font-black">
            {correct ? `🎉 ${t.detective.solved}` : `😵 ${t.detective.wrong}`}
          </p>
          <p className="text-sm mt-1">
            {fmt(t.detective.answer, { g: hidden.join('') })}{' '}
            {hiddenIsHet
              ? fmt(t.detective.explainHet, { r: tester[0], p: recPheno.name[lang] })
              : fmt(t.detective.explainHomo, { d: hidden[0], p: domPheno.name[lang] })}
          </p>
          {correct && !(hiddenIsHet ? sawRecessive : all.length >= 8) && (
            <p className="text-sm mt-1 opacity-90">🍀 {t.detective.luckyNote}</p>
          )}
          <button
            onClick={nextCase}
            className="mt-3 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 font-bold"
          >
            {t.detective.next} →
          </button>
        </div>
      )}
    </div>
  );
}
