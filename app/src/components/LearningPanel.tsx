import { useState, useMemo } from 'react';
import type { Gene, AllelePair, Language } from '../types/genetics';
import {
  generatePunnettSquare,
  gameteLabel,
  genotypeString,
  phenotypeLabel,
  simplifyRatio,
  isHomozygous,
} from '../utils/genetics';
import { fmt, type TranslationKeys } from '../i18n/translations';
import { glossary, funFacts } from '../data/learn';
import { peaSeedColorGene, peaSeedShapeGene } from '../data/presets';
import OrganismIcon from './OrganismIcon';

export type TryTab = 'meiosis' | 'cross' | 'trial';

interface Props {
  genes: Gene[];
  parent1Alleles: AllelePair[];
  parent2Alleles: AllelePair[];
  t: TranslationKeys;
  lang: Language;
  onTry: (presetId: string, p1: AllelePair[], p2: AllelePair[], tab: TryTab) => void;
}

function Pea({ color, shape = 'round', size = 36 }: { color: string; shape?: string; size?: number }) {
  return <OrganismIcon genes={[peaSeedColorGene, peaSeedShapeGene]} phenotypeIds={[color, shape]} size={size} />;
}

export default function LearningPanel({ genes, parent1Alleles, parent2Alleles, t, lang, onTry }: Props) {
  const [flipped, setFlipped] = useState<number | null>(null);
  const [factIndex, setFactIndex] = useState(0);

  const explanation = useMemo(() => {
    const p = generatePunnettSquare(genes, parent1Alleles, parent2Alleles);
    const lines: string[] = [];
    lines.push(fmt(t.learn.parentsLine, { p1: genotypeString(parent1Alleles), p2: genotypeString(parent2Alleles) }));
    lines.push(
      fmt(t.learn.gametesLine, { sex: '♀', g: p.motherGametes.map(gameteLabel).join(', '), n: p.motherGametes.length })
    );
    lines.push(
      fmt(t.learn.gametesLine, { sex: '♂', g: p.fatherGametes.map(gameteLabel).join(', '), n: p.fatherGametes.length })
    );
    const ratio = simplifyRatio(p.phenotypeCounts.map((e) => e.count));
    lines.push(
      fmt(t.learn.ratioLine, {
        names: p.phenotypeCounts.map((e) => phenotypeLabel(genes, e.key, lang)).join(' : '),
        r: ratio.join(' : '),
      })
    );

    let interp: string | null = null;
    if (genes.length === 1) {
      const [a, b] = [parent1Alleles[0], parent2Alleles[0]];
      const homoA = isHomozygous(a);
      const homoB = isHomozygous(b);
      const gene = genes[0];
      const recessive = gene.alleles[gene.alleles.length - 1].symbol;
      const isRecHomo = (x: AllelePair) => x[0] === recessive && x[1] === recessive;
      if (homoA && homoB && a[0] !== b[0]) interp = gene.inheritance === 'incomplete' ? t.learn.interpPureIncomplete : t.learn.interpPure;
      else if (!homoA && !homoB && a.join() === b.join()) {
        interp =
          gene.inheritance === 'incomplete'
            ? t.learn.interpF2Incomplete
            : gene.inheritance === 'lethal'
            ? t.learn.interpF2Lethal
            : gene.inheritance === 'complete'
            ? t.learn.interpF2
            : null;
      } else if ((!homoA && isRecHomo(b)) || (!homoB && isRecHomo(a))) interp = t.learn.interpTest;
    } else if (genes.length === 2) {
      const allHet = [...parent1Alleles, ...parent2Alleles].every((x) => !isHomozygous(x));
      interp = allHet ? t.learn.interpDihybrid : t.learn.interpDihybridGeneric;
    }
    if (interp) lines.push(`→ ${interp}`);
    return lines;
  }, [genes, parent1Alleles, parent2Alleles, t, lang]);

  const laws = [
    {
      key: 'dominance',
      title: t.learn.dominanceLaw,
      desc: t.learn.dominanceLawDesc,
      color: 'from-sky-500 to-blue-600',
      visual: (
        <div className="flex items-center gap-1.5">
          <Pea color="yellow" />
          <span className="font-bold">×</span>
          <Pea color="green" />
          <span className="font-bold">→</span>
          <Pea color="yellow" size={44} />
        </div>
      ),
      action: () => onTry('peaSeedColor', [['Y', 'Y']], [['y', 'y']], 'cross'),
    },
    {
      key: 'segregation',
      title: t.learn.segregationLaw,
      desc: t.learn.segregationLawDesc,
      color: 'from-emerald-500 to-teal-600',
      visual: (
        <div className="flex items-center gap-2 font-mono font-black text-lg">
          <span className="px-2 py-1 rounded-lg bg-white/25">Yy</span>
          <span>→</span>
          <span className="px-2 py-1 rounded-full bg-white/25">Y</span>
          <span className="px-2 py-1 rounded-full bg-white/25">y</span>
        </div>
      ),
      action: () => onTry('peaSeedColor', [['Y', 'y']], [['Y', 'y']], 'meiosis'),
    },
    {
      key: 'independent',
      title: t.learn.independentLaw,
      desc: t.learn.independentLawDesc,
      color: 'from-violet-500 to-fuchsia-600',
      visual: (
        <div className="flex items-center gap-1">
          <Pea color="yellow" size={28} />
          <Pea color="yellow" shape="wrinkled" size={28} />
          <Pea color="green" size={28} />
          <Pea color="green" shape="wrinkled" size={28} />
        </div>
      ),
      action: () => onTry('dihybrid', [['Y', 'y'], ['R', 'r']], [['Y', 'y'], ['R', 'r']], 'meiosis'),
    },
  ];

  const fact = funFacts[factIndex % funFacts.length];

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">📖 {t.learn.title}</h2>

      {/* Laws */}
      <div className="grid md:grid-cols-3 gap-4">
        {laws.map((law, i) => (
          <div
            key={law.key}
            className={`rounded-2xl p-4 text-white bg-gradient-to-br ${law.color} shadow-md flex flex-col animate-fade-up`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <p className="text-xs font-bold opacity-80">LAW {i + 1}</p>
            <h3 className="font-black text-lg mb-2">{law.title}</h3>
            <div className="mb-3 bg-white/15 rounded-xl p-2 self-start">{law.visual}</div>
            <p className="text-sm leading-relaxed opacity-95 flex-1">{law.desc}</p>
            <button
              onClick={law.action}
              className="mt-3 self-start px-3 py-1.5 rounded-full bg-white text-slate-800 text-sm font-bold hover:scale-105 transition-transform"
            >
              {t.learn.tryIt} →
            </button>
          </div>
        ))}
      </div>

      {/* Current cross explanation */}
      <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
        <h3 className="font-bold text-amber-700 dark:text-amber-300 mb-2">📝 {t.learn.currentExplanation}</h3>
        <div className="space-y-1">
          {explanation.map((line, i) => (
            <p
              key={i}
              className={`text-sm ${
                line.startsWith('→') ? 'font-bold text-amber-800 dark:text-amber-200 pt-1' : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Fun facts */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-sky-50 dark:from-emerald-950/40 dark:to-sky-950/40 border border-emerald-200 dark:border-emerald-900 p-4 flex items-start gap-4">
        <span key={factIndex} className="text-4xl animate-pop-in">
          {fact.icon}
        </span>
        <div className="flex-1">
          <h3 className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">
            💡 {t.learn.didYouKnow}{' '}
            <span className="font-mono text-xs text-slate-400">
              {(factIndex % funFacts.length) + 1}/{funFacts.length}
            </span>
          </h3>
          <p key={`t${factIndex}`} className="text-sm text-slate-700 dark:text-slate-200 mt-1 animate-fade-up">
            {fact.text[lang]}
          </p>
        </div>
        <button
          onClick={() => setFactIndex((i) => i + 1)}
          className="shrink-0 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600"
        >
          {t.learn.nextFact} →
        </button>
      </div>

      {/* Glossary */}
      <div>
        <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-1">🗂️ {t.learn.glossary}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t.learn.glossaryHint}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {glossary.map((g, i) => {
            const open = flipped === i;
            return (
              <button
                key={g.term.ja}
                onClick={() => setFlipped(open ? null : i)}
                aria-expanded={open}
                className={`text-left rounded-xl p-3 min-h-[92px] border-2 transition-all ${
                  open
                    ? 'bg-violet-500 border-violet-500 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-violet-300 hover:-translate-y-0.5'
                }`}
              >
                <p className={`font-bold ${open ? 'text-sm' : 'text-base'}`}>{g.term[lang]}</p>
                {open ? (
                  <p className="text-xs mt-1 leading-relaxed animate-fade-up">{g.definition[lang]}</p>
                ) : (
                  <p className="text-xs mt-2 text-slate-400">？ {t.learn.tapToReveal}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
