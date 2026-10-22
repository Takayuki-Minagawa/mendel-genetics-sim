# Mendelian Genetics & Meiosis Simulator

高校生物の「遺伝」「減数分裂」を対話的に学べる Web シミュレーターです。親個体の遺伝子型を設定し、減数分裂の過程や交配結果を視覚的に確認できます。

An interactive web simulator for studying Mendelian genetics and meiosis. Set parental genotypes to visually explore meiosis, Punnett squares, and inheritance patterns.

## Features

### Meiosis View / 減数分裂ビュー

Canvas アニメーションで減数分裂の全過程（間期 → 第一分裂 → 第二分裂 → 配偶子完成）を表示します。段階の間は染色体と細胞がなめらかに動き、各段階に解説が付きます。父由来・母由来の相同染色体を色分けし、中期Ⅰの並び方は毎回ランダムです（独立の法則）。「もう一度」で繰り返すと、できた配偶子の種類と割合が集計されます。

### Cross View / 交配ビュー（パネット方眼）

配偶子の組み合わせを、エンドウ・花・血液・マウスのイラスト付きのパネット方眼で表示します。マスをクリックすると「どの配偶子が受精し、なぜその表現型になるのか」を解説します。表現型比・遺伝子型比は整数比（例: 3 : 1, 9 : 3 : 3 : 1）で示します。

### Trial Mode / 確率的試行モード

1. 出現率がもっとも低い表現型の割合を予想する
2. 子を 10〜10,000 個体つくる（アニメーション付き）
3. 理論値と比べ、大数の法則の収束グラフを見る

エンドウのプリセットでは、メンデルが実際に数えた結果（例: 黄 6022 : 緑 2001）と同じ個体数で再現・比較できます。

### Challenge / チャレンジ

| ゲーム | 内容 |
|---|---|
| 遺伝子型探偵 | 検定交雑を繰り返し、謎の個体が AA か Aa かを見破る。「ヘテロ接合ならこうなる確率」がリアルタイムで表示される |
| パネット穴埋め | 空いたマスに遺伝子型を入れる（やさしい / ふつう / むずかしい = 2遺伝子） |
| 理解度クイズ | 18 問から毎回 8 問を出題。連続正解でボーナス XP |

### Learning Panel / 学習パネル

メンデルの 3 法則カード（「シミュレーターで確かめる」ボタンで該当の設定へジャンプ）、いまの交配の解説、メンデルにまつわる豆知識、タップで意味が見られる用語カードを収録しています。

### Gamification / レベルとバッジ

操作や正解で XP がたまり、レベル（見習い研究者 → … → メンデル超え）が上がります。15 種類のバッジがあり、獲得時には紙吹雪とトーストで通知します。進捗はブラウザの localStorage に保存されます。

### Presets / プリセット

| プリセット | 内容 |
|---|---|
| エンドウの種子の色 (Y) | 黄色 / 緑色（完全顕性） |
| エンドウの種子の形 (R) | 丸 / しわ（完全顕性） |
| マルバアサガオの花色 (R) | 赤 / 桃 / 白（不完全顕性, 1:2:1） |
| ABO式血液型 | A / B / O の複対立遺伝子（共顕性） |
| ネズミの毛色 (Y) | 黄色の YY が致死となる致死遺伝子（2:1） |
| 2遺伝子雑種 (YR) | 種子色 + 種子形状（9:3:3:1） |

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
      MeiosisView.tsx        Meiosis animation (Canvas, tweened layouts)
      PunnettSquare.tsx      Punnett square with cell explanations
      TrialMode.tsx          Prediction + random trials + convergence chart
      ChallengeMode.tsx      Challenge tab (challenge/: detective, puzzle, quiz)
      LearningPanel.tsx      Laws, current cross, fun facts, glossary
      ParentSettings.tsx     Parent genotype selector
      OrganismIcon.tsx       SVG illustrations (pea, flower, blood, mouse)
      AchievementsModal.tsx  Level and badge overview
    data/
      presets.ts             Preset configurations
      quizzes.ts             Quiz questions
      meiosis.ts             Meiosis stages and explanations
      learn.ts               Glossary and fun facts
      achievements.ts        Badges and levels
    progress/                XP / badge state (React context, localStorage)
    hooks/                   useTheme, useLanguage
    i18n/                    Japanese / English translations
    types/
      genetics.ts            Type definitions (Gene, Allele, Gamete, etc.)
    utils/
      genetics.ts            Genetics logic (gamete generation, crossing, Punnett square)
      explain.ts             Per-genotype explanations
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
