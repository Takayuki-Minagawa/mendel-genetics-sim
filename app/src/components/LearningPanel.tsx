import { useState, useMemo } from 'react';
import type { Gene, AllelePair } from '../types/genetics';
import { generatePunnettSquare, generateGametes, gameteLabel } from '../utils/genetics';
import type { TranslationKeys, Language } from '../i18n/translations';
import { quizQuestions } from '../data/quizzes';

interface Props {
  genes: Gene[];
  parent1Alleles: AllelePair[];
  parent2Alleles: AllelePair[];
  t: TranslationKeys;
  language: Language;
}

export default function LearningPanel({
  genes,
  parent1Alleles,
  parent2Alleles,
  t,
  language,
}: Props) {
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const punnett = useMemo(
    () => generatePunnettSquare(genes, parent1Alleles, parent2Alleles),
    [genes, parent1Alleles, parent2Alleles]
  );

  const motherGametes = useMemo(
    () => generateGametes(genes, parent1Alleles),
    [genes, parent1Alleles]
  );
  const fatherGametes = useMemo(
    () => generateGametes(genes, parent2Alleles),
    [genes, parent2Alleles]
  );

  const currentQuiz = quizQuestions[quizIndex % quizQuestions.length];

  const explanation = useMemo(() => {
    const lines: string[] = [];
    const isJa = language === 'ja';

    // Parent genotypes
    const p1Geno = parent1Alleles.map((p) => p.join('')).join(' ');
    const p2Geno = parent2Alleles.map((p) => p.join('')).join(' ');
    lines.push(
      isJa
        ? `親の遺伝子型: ♀ ${p1Geno} × ♂ ${p2Geno}`
        : `Parent genotypes: ♀ ${p1Geno} × ♂ ${p2Geno}`
    );

    // Gametes
    lines.push(
      isJa
        ? `♀の配偶子: ${motherGametes.map(gameteLabel).join(', ')} (${motherGametes.length}種類)`
        : `♀ gametes: ${motherGametes.map(gameteLabel).join(', ')} (${motherGametes.length} types)`
    );
    lines.push(
      isJa
        ? `♂の配偶子: ${fatherGametes.map(gameteLabel).join(', ')} (${fatherGametes.length}種類)`
        : `♂ gametes: ${fatherGametes.map(gameteLabel).join(', ')} (${fatherGametes.length} types)`
    );

    // Phenotype ratios
    const ratioEntries = Object.entries(punnett.phenotypeRatios);
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const counts = ratioEntries.map(([, r]) => Math.round(r * punnett.grid.length * punnett.grid[0].length));
    let g = counts[0];
    for (let i = 1; i < counts.length; i++) g = gcd(g, counts[i]);
    const simplified = counts.map((c) => c / g);
    const ratioStr = ratioEntries
      .map(([name], i) => `${name} : ${simplified[i]}`)
      .join(' , ');
    lines.push(isJa ? `表現型の比 = ${ratioStr}` : `Phenotype ratio = ${ratioStr}`);

    // Interpretation
    if (genes.length === 1) {
      const p1 = parent1Alleles[0];
      const p2 = parent2Alleles[0];
      if (p1[0] === p1[1] && p2[0] === p2[1] && p1[0] !== p2[0]) {
        lines.push(
          isJa
            ? '→ 純系同士の交配（P世代）。F1はすべてヘテロ接合体（Aa）となり、優性形質のみが現れます。'
            : '→ Cross of pure lines (P generation). All F1 are heterozygous (Aa), showing only the dominant phenotype.'
        );
      } else if (p1[0] !== p1[1] && p2[0] !== p2[1]) {
        lines.push(
          isJa
            ? '→ ヘテロ接合体同士の交配（F1 × F1）。F2世代では3:1の分離比が期待されます。'
            : '→ Cross of heterozygotes (F1 × F1). A 3:1 segregation ratio is expected in the F2 generation.'
        );
      }
    } else if (genes.length === 2) {
      lines.push(
        isJa
          ? '→ 2遺伝子の独立遺伝です。各遺伝子は独立に分配されるため、配偶子は4種類ずつ生じます。'
          : '→ Dihybrid cross with independent assortment. Each gene assorts independently, producing 4 types of gametes.'
      );
    }

    return lines;
  }, [genes, parent1Alleles, parent2Alleles, motherGametes, fatherGametes, punnett, language]);

  const checkAnswer = () => {
    setShowResult(true);
    setAnswered((a) => a + 1);
    if (selectedAnswer === currentQuiz.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const nextQuestion = () => {
    setQuizIndex((i) => i + 1);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Laws */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t.learn.title}</h3>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
          <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-1">
            {t.learn.dominanceLaw}
          </h4>
          <p className="text-sm text-blue-600 dark:text-blue-400">{t.learn.dominanceLawDesc}</p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
          <h4 className="font-bold text-green-700 dark:text-green-300 mb-1">
            {t.learn.segregationLaw}
          </h4>
          <p className="text-sm text-green-600 dark:text-green-400">{t.learn.segregationLawDesc}</p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-500">
          <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-1">
            {t.learn.independentLaw}
          </h4>
          <p className="text-sm text-purple-600 dark:text-purple-400">
            {t.learn.independentLawDesc}
          </p>
        </div>
      </div>

      {/* Current Cross Explanation */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <h4 className="font-bold text-yellow-700 dark:text-yellow-300 mb-2">
          {t.learn.currentExplanation}
        </h4>
        <div className="space-y-1">
          {explanation.map((line, i) => (
            <p key={i} className="text-sm text-yellow-800 dark:text-yellow-200">
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Quiz */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1">{t.learn.quizTitle}</h4>
        {answered > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {t.learn.score}: {score}/{answered}
          </p>
        )}

        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {language === 'ja' ? currentQuiz.questionJa : currentQuiz.questionEn}
        </p>

        <div className="space-y-2">
          {currentQuiz.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => !showResult && setSelectedAnswer(i)}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors border ${
                selectedAnswer === i
                  ? showResult
                    ? i === currentQuiz.correctIndex
                      ? 'border-green-500 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      : 'border-red-500 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                    : 'border-blue-500 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                  : showResult && i === currentQuiz.correctIndex
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {language === 'ja' ? opt.ja : opt.en}
            </button>
          ))}
        </div>

        {showResult && (
          <div
            className={`mt-3 p-3 rounded-lg text-sm ${
              selectedAnswer === currentQuiz.correctIndex
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
            }`}
          >
            <p className="font-bold mb-1">
              {selectedAnswer === currentQuiz.correctIndex ? t.learn.correct : t.learn.incorrect}
            </p>
            <p>{language === 'ja' ? currentQuiz.explanationJa : currentQuiz.explanationEn}</p>
          </div>
        )}

        <div className="flex gap-2 mt-3">
          {!showResult && selectedAnswer !== null && (
            <button
              onClick={checkAnswer}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              {t.learn.checkAnswer}
            </button>
          )}
          {showResult && (
            <button
              onClick={nextQuestion}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              {t.learn.next}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
