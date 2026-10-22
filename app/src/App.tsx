import { useState, useCallback, useEffect } from 'react';
import type { AllelePair, Language } from './types/genetics';
import { presets } from './data/presets';
import { useTheme } from './hooks/useTheme';
import { useLanguage } from './hooks/useLanguage';
import type { TranslationKeys } from './i18n/translations';
import { possibleGenotypes, randomItem } from './utils/genetics';
import ProgressProvider from './progress/ProgressProvider';
import { useProgress } from './progress/useProgress';
import MeiosisView from './components/MeiosisView';
import PunnettSquare from './components/PunnettSquare';
import TrialMode from './components/TrialMode';
import ChallengeMode from './components/ChallengeMode';
import LearningPanel, { type TryTab } from './components/LearningPanel';
import ParentSettings from './components/ParentSettings';
import AchievementsModal from './components/AchievementsModal';
import LevelBadge from './components/LevelBadge';
import OrganismIcon from './components/OrganismIcon';

type Tab = 'meiosis' | 'cross' | 'trial' | 'challenge' | 'learn';

const sameAlleles = (a: AllelePair[], b: AllelePair[]) => JSON.stringify(a) === JSON.stringify(b);

function AppContent({
  t,
  language,
  toggleLanguage,
  theme,
  toggleTheme,
}: {
  t: TranslationKeys;
  language: Language;
  toggleLanguage: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}) {
  const { state, unlock, markSeen } = useProgress();
  const [activeTab, setActiveTab] = useState<Tab>('cross');
  const [presetIndex, setPresetIndex] = useState(0);
  const [showBadges, setShowBadges] = useState(false);
  const [welcomeClosed, setWelcomeClosed] = useState(false);

  const currentPreset = presets[presetIndex];
  const [parent1Alleles, setParent1Alleles] = useState<AllelePair[]>(currentPreset.parent1);
  const [parent2Alleles, setParent2Alleles] = useState<AllelePair[]>(currentPreset.parent2);

  const trackPreset = useCallback(
    (id: string) => {
      if (markSeen('presets', id) >= presets.length) unlock('explorer');
    },
    [markSeen, unlock]
  );

  useEffect(() => {
    trackPreset(presets[0].id);
  }, [trackPreset]);

  const handlePresetChange = (index: number) => {
    setPresetIndex(index);
    setParent1Alleles(presets[index].parent1);
    setParent2Alleles(presets[index].parent2);
    trackPreset(presets[index].id);
  };

  const handleParentChange = (parentIndex: 0 | 1, alleles: AllelePair[]) => {
    if (parentIndex === 0) setParent1Alleles(alleles);
    else setParent2Alleles(alleles);
    unlock('firstSteps');
  };

  const handleRandomParents = () => {
    setParent1Alleles(currentPreset.genes.map((g) => randomItem(possibleGenotypes(g))));
    setParent2Alleles(currentPreset.genes.map((g) => randomItem(possibleGenotypes(g))));
    unlock('firstSteps');
  };

  const handleTry = (presetId: string, p1: AllelePair[], p2: AllelePair[], tab: TryTab) => {
    const index = presets.findIndex((p) => p.id === presetId);
    if (index === -1) return;
    setPresetIndex(index);
    setParent1Alleles(p1);
    setParent2Alleles(p2);
    trackPreset(presetId);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mendelData =
    currentPreset.mendelData &&
    sameAlleles(parent1Alleles, currentPreset.parent1) &&
    sameAlleles(parent2Alleles, currentPreset.parent2)
      ? currentPreset.mendelData
      : undefined;

  const tabs: { key: Tab; icon: string; label: string }[] = [
    { key: 'meiosis', icon: '🧬', label: t.tabs.meiosis },
    { key: 'cross', icon: '🟩', label: t.tabs.cross },
    { key: 'trial', icon: '🎲', label: t.tabs.trial },
    { key: 'challenge', icon: '🎮', label: t.tabs.challenge },
    { key: 'learn', icon: '📖', label: t.tabs.learn },
  ];

  const usesSettings = activeTab !== 'challenge';

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-slate-50 to-sky-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 dark:from-emerald-800 dark:via-teal-800 dark:to-sky-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 w-11 h-11 rounded-2xl bg-white/90 flex items-center justify-center shadow animate-float">
              <OrganismIcon genes={presets[0].genes} phenotypeIds={['yellow']} size={34} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base md:text-xl font-black text-white truncate">{t.title}</h1>
              <p className="hidden sm:block text-xs text-white/85">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <LevelBadge onClick={() => setShowBadges(true)} t={t} lang={language} />
            <button
              onClick={toggleLanguage}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold"
              aria-label={language === 'ja' ? 'Switch to English' : '日本語に切り替え'}
            >
              {language === 'ja' ? 'EN' : 'JA'}
            </button>
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30"
              aria-label={theme === 'light' ? t.theme.dark : t.theme.light}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-5">
        {/* Welcome banner for first-time visitors */}
        {state.xp === 0 && !welcomeClosed && (
          <section className="animate-fade-up mb-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-200 dark:border-emerald-800 p-5 shadow-sm relative">
            <button
              onClick={() => setWelcomeClosed(true)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={t.welcome.close}
            >
              ✕
            </button>
            <h2 className="text-lg font-black text-emerald-700 dark:text-emerald-300">👋 {t.welcome.title}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{t.welcome.body}</p>
            <div className="grid sm:grid-cols-3 gap-2 mt-3">
              {[t.welcome.step1, t.welcome.step2, t.welcome.step3].map((s, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 text-sm">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-slate-700 dark:text-slate-200">{s}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Control Panel */}
        {usesSettings && (
          <section className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm p-4 md:p-5 mb-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h2 className="text-sm font-bold text-slate-600 dark:text-slate-300">{t.controls.preset}</h2>
              <button
                onClick={handleRandomParents}
                className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/70"
              >
                🎲 {t.controls.randomize}
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto sm:flex-wrap pb-2 -mx-1 px-1">
              {presets.map((preset, i) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetChange(i)}
                  className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-bold transition-all border-2 ${
                    i === presetIndex
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-700 dark:text-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-lg">{preset.icon}</span>
                  {preset.name[language]}
                  {state.seen.presets?.includes(preset.id) && i !== presetIndex && (
                    <span className="text-[10px] text-emerald-500">✓</span>
                  )}
                </button>
              ))}
            </div>
            <p key={currentPreset.id} className="animate-fade-up text-xs text-slate-500 dark:text-slate-400 mb-4 mt-1">
              💡 {currentPreset.description[language]}
            </p>

            <ParentSettings
              genes={currentPreset.genes}
              parent1Alleles={parent1Alleles}
              parent2Alleles={parent2Alleles}
              onParentChange={handleParentChange}
              t={t}
              lang={language}
            />
          </section>
        )}

        {/* Tab Navigation */}
        <nav className="sticky top-0 z-30 -mx-4 px-4 py-2 mb-3 bg-gradient-to-b from-slate-50/95 to-slate-50/80 dark:from-slate-950/95 dark:to-slate-950/80 backdrop-blur">
          <div className="flex gap-1.5 overflow-x-auto" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-full transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* View Area */}
        <section
          key={activeTab}
          className="animate-fade-up bg-white dark:bg-slate-900 rounded-3xl shadow-sm p-4 md:p-6 border border-slate-200 dark:border-slate-800"
        >
          {activeTab === 'meiosis' && (
            <MeiosisView
              genes={currentPreset.genes}
              parent1Alleles={parent1Alleles}
              parent2Alleles={parent2Alleles}
              t={t}
              lang={language}
              theme={theme}
            />
          )}
          {activeTab === 'cross' && (
            <PunnettSquare
              genes={currentPreset.genes}
              parent1Alleles={parent1Alleles}
              parent2Alleles={parent2Alleles}
              t={t}
              lang={language}
            />
          )}
          {activeTab === 'trial' && (
            <TrialMode
              genes={currentPreset.genes}
              parent1Alleles={parent1Alleles}
              parent2Alleles={parent2Alleles}
              t={t}
              lang={language}
              mendelData={mendelData}
            />
          )}
          {activeTab === 'challenge' && <ChallengeMode t={t} lang={language} />}
          {activeTab === 'learn' && (
            <LearningPanel
              genes={currentPreset.genes}
              parent1Alleles={parent1Alleles}
              parent2Alleles={parent2Alleles}
              t={t}
              lang={language}
              onTry={handleTry}
            />
          )}
        </section>
      </main>

      <footer className="text-center py-6 text-xs text-slate-400 dark:text-slate-600">
        🌱 Mendelian Genetics & Meiosis Simulator
      </footer>

      {showBadges && <AchievementsModal onClose={() => setShowBadges(false)} t={t} lang={language} />}
    </div>
  );
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <ProgressProvider language={language}>
      <AppContent t={t} language={language} toggleLanguage={toggleLanguage} theme={theme} toggleTheme={toggleTheme} />
    </ProgressProvider>
  );
}
