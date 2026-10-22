import { useState, useRef, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import { ProgressContext, type ProgressApi, type ProgressState } from './progressContext';
import { achievements, levelFor, type AchievementId } from '../data/achievements';
import type { Language } from '../types/genetics';
import Confetti from '../components/Confetti';

const STORAGE_KEY = 'genetics-progress';
const BADGE_XP = 30;

const emptyState = (): ProgressState => ({ xp: 0, badges: [], stats: {}, seen: {} });

// Keeps only well-formed entries, so old or corrupted saves cannot crash the app
function sanitizeRecord<T>(value: unknown, isValid: (v: unknown) => v is T): Record<string, T> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([, v]) => isValid(v))) as Record<string, T>;
}

function loadState(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
      badges: Array.isArray(parsed.badges)
        ? parsed.badges.filter((b): b is AchievementId => achievements.some((a) => a.id === b))
        : [],
      stats: sanitizeRecord(parsed.stats, (v): v is number => typeof v === 'number'),
      seen: sanitizeRecord(parsed.seen, (v): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string')),
    };
  } catch {
    return emptyState();
  }
}

interface Toast {
  id: number;
  icon: string;
  title: string;
  subtitle?: string;
  kind: 'xp' | 'badge' | 'level';
}

interface Props {
  language: Language;
  children: ReactNode;
}

export default function ProgressProvider({ language, children }: Props) {
  const [state, setState] = useState<ProgressState>(loadState);
  const stateRef = useRef(state);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confettiKey, setConfettiKey] = useState(0);
  const toastId = useRef(0);
  const langRef = useRef(language);

  useEffect(() => {
    langRef.current = language;
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage may be unavailable (private mode); progress then lasts for the session only
    }
  }, [state]);

  const commit = useCallback((next: ProgressState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const pushToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = ++toastId.current;
    setToasts((ts) => [...ts.slice(-2), { ...toast, id }]);
    window.setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), toast.kind === 'xp' ? 1800 : 3600);
  }, []);

  const celebrate = useCallback(() => {
    setConfettiKey((k) => k + 1);
  }, []);

  const addXp = useCallback(
    (amount: number, reason?: string, silent = false) => {
      if (amount <= 0) return;
      const prev = stateRef.current;
      const before = levelFor(prev.xp);
      const next = { ...prev, xp: prev.xp + amount };
      commit(next);
      const after = levelFor(next.xp);
      const lang = langRef.current;
      if (after.level > before.level) {
        pushToast({
          kind: 'level',
          icon: '⬆️',
          title: lang === 'ja' ? `レベル${after.level}にアップ！` : `Level up! Lv.${after.level}`,
          subtitle: after.title[lang],
        });
        celebrate();
      } else if (!silent) {
        pushToast({ kind: 'xp', icon: '✨', title: `+${amount} XP`, subtitle: reason });
      }
    },
    [commit, pushToast, celebrate]
  );

  const unlock = useCallback(
    (id: AchievementId) => {
      const prev = stateRef.current;
      if (prev.badges.includes(id)) return;
      commit({ ...prev, badges: [...prev.badges, id] });
      const a = achievements.find((x) => x.id === id);
      const lang = langRef.current;
      if (a) {
        pushToast({
          kind: 'badge',
          icon: a.icon,
          title: lang === 'ja' ? `バッジ獲得！「${a.name.ja}」` : `Badge unlocked: ${a.name.en}`,
          subtitle: a.description[lang],
        });
      }
      celebrate();
      addXp(BADGE_XP, undefined, true);
    },
    [commit, pushToast, celebrate, addXp]
  );

  const bump = useCallback(
    (stat: string, by = 1) => {
      const prev = stateRef.current;
      const value = (prev.stats[stat] ?? 0) + by;
      commit({ ...prev, stats: { ...prev.stats, [stat]: value } });
      return value;
    },
    [commit]
  );

  const markSeen = useCallback(
    (set: string, value: string) => {
      const prev = stateRef.current;
      const current = prev.seen[set] ?? [];
      if (current.includes(value)) return current.length;
      const updated = [...current, value];
      commit({ ...prev, seen: { ...prev.seen, [set]: updated } });
      return updated.length;
    },
    [commit]
  );

  const markOnce = useCallback(
    (set: string, value: string) => {
      const before = stateRef.current.seen[set]?.length ?? 0;
      return markSeen(set, value) > before;
    },
    [markSeen]
  );

  const reset = useCallback(() => {
    commit(emptyState());
  }, [commit]);

  const api: ProgressApi = useMemo(
    () => ({ state, levelInfo: levelFor(state.xp), addXp, unlock, bump, markSeen, markOnce, celebrate, reset }),
    [state, addXp, unlock, bump, markSeen, markOnce, celebrate, reset]
  );

  return (
    <ProgressContext.Provider value={api}>
      {children}
      {confettiKey > 0 && <Confetti key={confettiKey} />}
      <div
        className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2 items-stretch sm:items-end pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-toast-in flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lg border sm:max-w-sm ${
              t.kind === 'xp'
                ? 'bg-white/95 dark:bg-slate-800/95 border-emerald-200 dark:border-emerald-700'
                : t.kind === 'level'
                ? 'bg-gradient-to-r from-amber-400 to-pink-500 text-white border-transparent'
                : 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white border-transparent'
            }`}
          >
            <span className={t.kind === 'xp' ? 'text-xl' : 'text-3xl animate-wiggle'}>{t.icon}</span>
            <div className="min-w-0">
              <p
                className={`font-bold text-sm ${
                  t.kind === 'xp' ? 'text-emerald-600 dark:text-emerald-400' : ''
                }`}
              >
                {t.title}
              </p>
              {t.subtitle && (
                <p
                  className={`text-xs truncate ${
                    t.kind === 'xp' ? 'text-slate-500 dark:text-slate-400' : 'text-white/90'
                  }`}
                >
                  {t.subtitle}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </ProgressContext.Provider>
  );
}
