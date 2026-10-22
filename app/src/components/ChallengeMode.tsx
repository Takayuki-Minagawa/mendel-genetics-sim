import { useState } from 'react';
import type { Language } from '../types/genetics';
import type { TranslationKeys } from '../i18n/translations';
import GenotypeDetective from './challenge/GenotypeDetective';
import PunnettPuzzle from './challenge/PunnettPuzzle';
import QuizGame from './challenge/QuizGame';

interface Props {
  t: TranslationKeys;
  lang: Language;
}

type Game = 'detective' | 'puzzle' | 'quiz';

export default function ChallengeMode({ t, lang }: Props) {
  const [game, setGame] = useState<Game>('detective');

  const games: { key: Game; icon: string; title: string; desc: string; gradient: string }[] = [
    { key: 'detective', icon: '🔍', title: t.challenge.detective, desc: t.challenge.detectiveDesc, gradient: 'from-indigo-500 to-violet-500' },
    { key: 'puzzle', icon: '🧩', title: t.challenge.puzzle, desc: t.challenge.puzzleDesc, gradient: 'from-amber-400 to-orange-500' },
    { key: 'quiz', icon: '❓', title: t.challenge.quiz, desc: t.challenge.quizDesc, gradient: 'from-violet-500 to-pink-500' },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">🎮 {t.tabs.challenge}</h2>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {games.map((g) => (
          <button
            key={g.key}
            onClick={() => setGame(g.key)}
            className={`text-left rounded-2xl p-3 sm:p-4 transition-all ${
              game === g.key
                ? `bg-gradient-to-br ${g.gradient} text-white shadow-lg scale-[1.02]`
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:-translate-y-0.5 hover:shadow'
            }`}
          >
            <span className="text-2xl sm:text-3xl">{g.icon}</span>
            <p className="font-bold text-sm sm:text-base mt-1">{g.title}</p>
            <p className={`hidden sm:block text-xs mt-1 ${game === g.key ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'}`}>
              {g.desc}
            </p>
          </button>
        ))}
      </div>

      <div key={game} className="animate-fade-up">
        {game === 'detective' && <GenotypeDetective t={t} lang={lang} />}
        {game === 'puzzle' && <PunnettPuzzle t={t} lang={lang} />}
        {game === 'quiz' && <QuizGame t={t} lang={lang} />}
      </div>
    </div>
  );
}
