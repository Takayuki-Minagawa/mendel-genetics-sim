import { useState, useCallback } from 'react';
import type { AllelePair } from './types/genetics';
import { presets } from './data/presets';
import { useTheme } from './hooks/useTheme';
import { useLanguage } from './hooks/useLanguage';
import MeiosisView from './components/MeiosisView';
import PunnettSquare from './components/PunnettSquare';
import TrialMode from './components/TrialMode';
import LearningPanel from './components/LearningPanel';
import ParentSettings from './components/ParentSettings';

type Tab = 'meiosis' | 'cross' | 'trial' | 'learn';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('cross');
  const [presetIndex, setPresetIndex] = useState(0);

  const currentPreset = presets[presetIndex];
  const [parent1Alleles, setParent1Alleles] = useState<AllelePair[]>(currentPreset.parent1);
  const [parent2Alleles, setParent2Alleles] = useState<AllelePair[]>(currentPreset.parent2);

  const handlePresetChange = useCallback(
    (index: number) => {
      setPresetIndex(index);
      const preset = presets[index];
      setParent1Alleles(preset.parent1);
      setParent2Alleles(preset.parent2);
    },
    []
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: 'meiosis', label: t.tabs.meiosis },
    { key: 'cross', label: t.tabs.cross },
    { key: 'trial', label: t.tabs.trial },
    { key: 'learn', label: t.tabs.learn },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">
            {t.title}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              {language === 'ja' ? 'EN' : 'JA'}
            </button>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Control Panel */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-6 border border-gray-200 dark:border-gray-700">
          {/* Preset Selection */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              {t.controls.preset}
            </label>
            <div className="flex gap-2 flex-wrap">
              {presets.map((preset, i) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetChange(i)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    i === presetIndex
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {t.presets[preset.nameKey as keyof typeof t.presets]}
                </button>
              ))}
            </div>
          </div>

          {/* Parent Settings */}
          <ParentSettings
            genes={currentPreset.genes}
            parent1Alleles={parent1Alleles}
            parent2Alleles={parent2Alleles}
            onParent1Change={setParent1Alleles}
            onParent2Change={setParent2Alleles}
            t={t}
          />
        </section>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-b-0 border-gray-200 dark:border-gray-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Area */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          {activeTab === 'meiosis' && (
            <MeiosisView
              genes={currentPreset.genes}
              parentAlleles={parent1Alleles}
              t={t}
            />
          )}
          {activeTab === 'cross' && (
            <PunnettSquare
              genes={currentPreset.genes}
              parent1Alleles={parent1Alleles}
              parent2Alleles={parent2Alleles}
              t={t}
            />
          )}
          {activeTab === 'trial' && (
            <TrialMode
              genes={currentPreset.genes}
              parent1Alleles={parent1Alleles}
              parent2Alleles={parent2Alleles}
              t={t}
            />
          )}
          {activeTab === 'learn' && (
            <LearningPanel
              genes={currentPreset.genes}
              parent1Alleles={parent1Alleles}
              parent2Alleles={parent2Alleles}
              t={t}
              language={language}
            />
          )}
        </section>
      </main>

      <footer className="text-center py-4 text-xs text-gray-400 dark:text-gray-600">
        Mendelian Genetics & Meiosis Simulator
      </footer>
    </div>
  );
}
