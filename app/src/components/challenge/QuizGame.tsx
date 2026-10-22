import { useState } from 'react';
import type { Language } from '../../types/genetics';
import { quizQuestions, type QuizQuestion } from '../../data/quizzes';
import { shuffle } from '../../utils/genetics';
import { fmt, type TranslationKeys } from '../../i18n/translations';
import { useProgress } from '../../progress/useProgress';

interface Props {
  t: TranslationKeys;
  lang: Language;
}

const ROUND_SIZE = 8;

// Shuffles questions and their options so answers can't be memorized by position
const newRound = (): QuizQuestion[] =>
  shuffle(quizQuestions)
    .slice(0, ROUND_SIZE)
    .map((q) => {
      const order = shuffle(q.options.map((_, i) => i));
      return { ...q, options: order.map((i) => q.options[i]), correctIndex: order.indexOf(q.correctIndex) };
    });

export default function QuizGame({ t, lang }: Props) {
  const { addXp, unlock, celebrate } = useProgress();
  const [round, setRound] = useState<QuizQuestion[]>(newRound);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = round[index];
  const answered = selected !== null;
  const isCorrect = answered && selected === q.correctIndex;

  const answer = (i: number) => {
    if (answered) return;
    setSelected(i);
    if (i === q.correctIndex) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setScore((s) => s + 1);
      addXp(nextStreak >= 3 ? 15 : 10, nextStreak >= 3 ? fmt(t.quiz.streakBonus, { n: nextStreak }) : t.quiz.correct);
      if (nextStreak >= 5) unlock('quizStreak');
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    if (index + 1 >= round.length) {
      setFinished(true);
      if (score === round.length) {
        unlock('quizPerfect');
        celebrate();
      }
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  };

  const restart = () => {
    setRound(newRound());
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const ratio = score / round.length;
    const rank =
      ratio === 1
        ? { icon: '👑', text: t.quiz.rank1 }
        : ratio >= 0.75
        ? { icon: '🎓', text: t.quiz.rank2 }
        : ratio >= 0.5
        ? { icon: '📚', text: t.quiz.rank3 }
        : { icon: '🌱', text: t.quiz.rank4 };
    return (
      <div className="text-center py-6 animate-pop-in">
        <div className="text-6xl mb-2 animate-float">{rank.icon}</div>
        <p className="text-3xl font-black text-slate-800 dark:text-slate-100">
          {score} / {round.length}
        </p>
        <p className="mt-1 font-bold text-violet-600 dark:text-violet-300">{rank.text}</p>
        <button
          onClick={restart}
          className="mt-5 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white font-bold shadow hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          🔁 {t.quiz.again}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex gap-1 flex-1">
          {round.map((_, i) => (
            <span
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i < index ? 'bg-violet-400' : i === index ? 'bg-violet-600 dark:bg-violet-300' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-mono text-slate-500">
          Q{index + 1}/{round.length}
        </span>
        <span
          className={`text-sm font-bold px-2 py-0.5 rounded-full ${
            streak >= 3 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300' : 'text-slate-400'
          }`}
          title={t.quiz.streak}
        >
          🔥 {streak}
        </span>
      </div>

      <p key={q.id} className="animate-fade-up text-base font-bold text-slate-800 dark:text-slate-100">
        {lang === 'ja' ? q.questionJa : q.questionEn}
      </p>

      <div className="grid sm:grid-cols-2 gap-2">
        {q.options.map((opt, i) => {
          const state = !answered
            ? 'idle'
            : i === q.correctIndex
            ? 'correct'
            : i === selected
            ? 'wrong'
            : 'dim';
          return (
            <button
              key={`${q.id}-${i}`}
              onClick={() => answer(i)}
              disabled={answered}
              className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                state === 'idle'
                  ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-violet-400 hover:-translate-y-0.5 hover:shadow'
                  : state === 'correct'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 animate-pop-in'
                  : state === 'wrong'
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 animate-shake'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 opacity-60'
              }`}
            >
              <span className="inline-block w-6 font-black text-violet-400">{String.fromCharCode(65 + i)}</span>
              {lang === 'ja' ? opt.ja : opt.en}
              {state === 'correct' && ' ✅'}
              {state === 'wrong' && ' ❌'}
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          className={`animate-fade-up rounded-xl p-4 text-sm ${
            isCorrect
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100'
          }`}
        >
          <p className="font-black mb-1">{isCorrect ? `🎉 ${t.quiz.correct}` : `💭 ${t.quiz.incorrect}`}</p>
          <p>{lang === 'ja' ? q.explanationJa : q.explanationEn}</p>
          <button
            onClick={next}
            className="mt-3 px-4 py-2 rounded-xl bg-violet-500 text-white font-bold hover:bg-violet-600"
          >
            {index + 1 >= round.length ? t.quiz.result : t.quiz.next} →
          </button>
        </div>
      )}
    </div>
  );
}
