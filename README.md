# Mendelian Genetics & Meiosis Simulator

高校生物の「遺伝」「減数分裂」を対話的に学べる Web シミュレーターです。親個体の遺伝子型を設定し、減数分裂の過程や交配結果を視覚的に確認できます。

An interactive web simulator for studying Mendelian genetics and meiosis. Set parental genotypes to visually explore meiosis, Punnett squares, and inheritance patterns.

## Features

### Meiosis View / 減数分裂ビュー

Canvas を用いて減数分裂の全過程（間期 → 第一分裂 → 第二分裂 → 配偶子完成）をステップごとにアニメーション表示します。2 遺伝子交配では独立の法則に基づき、遺伝子ごとにランダムな染色体配向を再現します。

### Cross View / 交配ビュー（パネット方眼）

親の配偶子を行列に配置した Punnett Square を自動生成し、遺伝子型比・表現型比を表示します。単一遺伝子から 2 遺伝子交配まで対応しています。

### Trial Mode / 確率的試行モード

設定した交配を指定回数だけ確率的に実行し、子世代の表現型分布をヒストグラムで表示します。試行回数を増やすと理論比に収束する様子を確認できます。

### Learning Panel / 学習パネル

遺伝の基礎知識に関する解説と、6 問のクイズを収録しています。

### Presets / プリセット

| プリセット | 内容 |
|---|---|
| 種子の色 (Y) | エンドウ豆の種子色（黄色 / 緑色） |
| 種子の形 (R) | エンドウ豆の種子形状（丸 / しわ） |
| 血液型 (ABO) | ABO 式血液型（A / B / O の 3 対立遺伝子、共優性） |
| 2 遺伝子独立遺伝 (YR) | 種子色 + 種子形状の二遺伝子雑種 |

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build**: Vite 8
- **Styling**: Tailwind CSS 4
- **Deployment**: GitHub Actions + GitHub Pages

## Project Structure

```
app/
  src/
    components/     UI components
      MeiosisView.tsx       Meiosis animation (Canvas)
      PunnettSquare.tsx      Punnett square grid
      TrialMode.tsx          Random trial simulation
      LearningPanel.tsx      Explanation and quiz
      ParentSettings.tsx     Parent genotype selector
    data/
      presets.ts             Preset configurations
      quizzes.ts             Quiz questions
    hooks/                   useTheme, useLanguage
    i18n/                    Japanese / English translations
    types/
      genetics.ts            Type definitions (Gene, Allele, Gamete, etc.)
    utils/
      genetics.ts            Genetics logic (gamete generation, crossing, Punnett square)
    App.tsx                  Main application
```

## Getting Started

```bash
cd app
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build

```bash
npm run build     # Output to app/dist/
npm run preview   # Preview the production build
```

### Lint

```bash
npm run lint
```

## Deployment

Pushing to `main` triggers GitHub Actions (`.github/workflows/deploy.yml`), which builds the app and deploys to GitHub Pages.

## UI

- Japanese / English toggle
- Light / Dark theme toggle
- Responsive layout (PC / tablet / mobile)

## License

This project is provided for educational purposes.
