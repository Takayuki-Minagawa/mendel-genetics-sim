import { useEffect, useRef } from 'react';
import type { Language } from '../types/genetics';
import type { TranslationKeys } from '../i18n/translations';
import { fmt } from '../i18n/translations';
import { achievements } from '../data/achievements';
import { useProgress } from '../progress/useProgress';

interface Props {
  onClose: () => void;
  t: TranslationKeys;
  lang: Language;
}

export default function AchievementsModal({ onClose, t, lang }: Props) {
  const { state, levelInfo, reset } = useProgress();
  const unlocked = new Set(state.badges);
  const progress = levelInfo.nextXp
    ? ((state.xp - levelInfo.minXp) / (levelInfo.nextXp - levelInfo.minXp)) * 100
    : 100;

  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleReset = () => {
    if (window.confirm(t.progress.resetConfirm)) reset();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.progress.title}
    >
      <div
        className="animate-toast-in w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500 text-white p-5 rounded-t-3xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold opacity-80">{t.progress.title}</p>
              <p className="text-2xl font-black">
                Lv.{levelInfo.level} {levelInfo.title[lang]}
              </p>
            </div>
            <button
              ref={closeRef}
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-lg"
              aria-label={t.progress.close}
            >
              ✕
            </button>
          </div>
          <div className="mt-3 h-3 rounded-full bg-white/30 overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-xs opacity-90">
            {state.xp} XP
            {levelInfo.nextXp !== null && ` · ${fmt(t.progress.toNext, { n: levelInfo.nextXp - state.xp })}`}
          </p>
        </div>

        <div className="p-5">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
            🏅 {t.progress.badges} ({unlocked.size}/{achievements.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievements.map((a) => {
              const got = unlocked.has(a.id);
              return (
                <div
                  key={a.id}
                  className={`rounded-2xl p-3 border-2 text-center ${
                    got
                      ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700'
                      : 'border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                  }`}
                >
                  <div className={`text-3xl ${got ? '' : 'grayscale opacity-30'}`}>{got ? a.icon : '🔒'}</div>
                  <p className={`mt-1 text-sm font-bold ${got ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}`}>
                    {got ? a.name[lang] : '？？？'}
                  </p>
                  <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400 mt-0.5">{a.description[lang]}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-5 text-right">
            <button onClick={handleReset} className="text-xs text-slate-400 hover:text-rose-500 underline">
              {t.progress.reset}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
