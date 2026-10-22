import type { Language } from '../types/genetics';
import type { TranslationKeys } from '../i18n/translations';
import { achievements } from '../data/achievements';
import { useProgress } from '../progress/useProgress';

interface Props {
  onClick: () => void;
  t: TranslationKeys;
  lang: Language;
}

export default function LevelBadge({ onClick, t, lang }: Props) {
  const { state, levelInfo } = useProgress();
  const progress = levelInfo.nextXp
    ? ((state.xp - levelInfo.minXp) / (levelInfo.nextXp - levelInfo.minXp)) * 100
    : 100;

  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 rounded-full bg-white/20 hover:bg-white/30 pl-1 pr-3 py-1 transition-colors"
      title={t.progress.title}
    >
      <span className="w-8 h-8 rounded-full bg-white text-emerald-600 font-black text-sm flex items-center justify-center shadow-inner">
        {levelInfo.level}
      </span>
      <span className="hidden sm:flex flex-col items-start leading-tight">
        <span className="text-[11px] font-bold text-white">{levelInfo.title[lang]}</span>
        <span className="w-24 h-1.5 rounded-full bg-white/30 overflow-hidden mt-0.5">
          <span className="block h-full bg-amber-300 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </span>
      </span>
      <span className="text-xs font-bold text-white">
        🏅{state.badges.length}/{achievements.length}
      </span>
    </button>
  );
}
