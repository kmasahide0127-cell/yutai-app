# 優待アプリ開発ガイド

## プロジェクト概要

「生活逆引き型」の株主優待マッチング+管理アプリ。
ユーザーが普段使うブランド・サービスから出発して、生活に組み込める優待を提案する。
既存サービス(みんかぶ優待、株主優待倶楽部等)とは異なり、優待を起点ではなく生活を起点に設計する。

## 中核コンセプト

- **生活逆引きマッチング**: ユーザーの生活情報を入力 → マッチする優待だけを提示
- **多面銘柄評価**: 優待だけでなく株価安定性、業績健全性、バリュエーションを統合
- **買い時スコア**: 権利確定日サイクル、価格水準、テクニカル指標を統合した買いタイミング指標
- **優待変更速報**: TDnetを監視し、改悪・改善・新設を即時通知
- **リカバリーシミュレーション**: 含み損銘柄について、優待+配当で何年で取り戻せるかを計算
- **行動経済学レイヤー**: FOMO、保有効果、サンクコストへの対抗UI

## 技術スタック

導入済みのものだけを書く。バージョンの正は package.json / scripts/requirements.txt。

### フロントエンド
- Next.js 15 (App Router、Turbopack でビルド) / React 19
- TypeScript (strict mode)
- Tailwind CSS v4
- shadcn/ui (Base UI ベース。`src/components/ui/` に button / card / checkbox / radio-group)
- Zustand + persist middleware (状態管理 + localStorage永続化)
- Lucide Icons (lucide-react)

### データ永続化(クライアントサイド完結)
- **localStorage**: Zustand persist で保存(オンボーディング入力、非表示にした項目など)
- サーバーサイドDBは使用しない(運用コストゼロ、プライバシー設計)

### 優待・株価データ
- 銘柄データは `src/lib/yutai-data.ts` の TypeScript 定数(`YUTAI_LIST`)としてリポジトリに含め、ビルド時に取り込む
- 商品名検索用のブランド辞書は `src/lib/brand-data.ts`
- 優待の「内容」は手動で照合・更新する(手順は WEEKLY_MAINTENANCE.md)

### データ処理(Pythonバッチ、`scripts/`)
- yfinance: 株価を取得して `yutai-data.ts` の投資額・利回りを更新(週次)
- やのしんTDnet WEB-API(標準ライブラリの urllib で取得): 優待関連の適時開示を検出して報告(週次)
- J-Quants API(jquants-api-client)/ pandas: 銘柄一覧・株価・財務の取得スクリプト(手動実行)
- GitHub Actions (`.github/workflows/weekly-data-update.yml`): 週次実行し、変更をPRとして作成

### テスト
- Vitest(`npm run test`、監視実行は `npm run test:watch`)
- テストは `src/lib/__tests__/` に置く。対象は `src/lib` の純粋ロジック(DOM を使うテストは未導入)

### インフラ
- Vercel (Next.jsホスティング。main ブランチのみ自動デプロイ)
- Google AdSense(`src/components/common/AdSenseScript.tsx` / `AdUnit.tsx`、`public/ads.txt`)

### 未導入(必要になった時点で導入を検討)
- Recharts(グラフ)、Dexie.js / IndexedDB(大容量データ)、React Hook Form(フォーム)、Sentry(エラー監視)

## ファイル構成

- `src/app/`: ページ(App Router)
- `src/components/`: 共通コンポーネント
- `src/components/ui/`: shadcn/ui コンポーネント
- `src/config/`: サイト名・URLなどの設定
- `src/lib/`: ロジック、ユーティリティ、静的データ(yutai-data.ts / brand-data.ts など)
- `src/lib/__tests__/`: ユニットテスト
- `src/store/`: Zustandストア(+ persist設定)
- `src/types/`: TypeScript型定義
- `scripts/`: 外部データ収集バッチ(Python、GitHub Actions実行)と補助スクリプト
- `docs/`: 生成した下書きなどの資料

## コーディングルール

### TypeScript
- strict modeを必ず有効化
- any型は原則禁止(やむを得ない場合はコメントで理由を記載)
- 型は src/types/ に集約
- 関数コンポーネント + Hooks前提、クラスコンポーネント禁止

### スタイリング
- Tailwind CSSのみ使用、別ファイルCSSは原則禁止
- shadcn/uiコンポーネントを優先利用、必要なら拡張
- 色・余白・フォントはTailwindのデザイントークンに統一
- ダークモード対応を最初から意識(dark: プレフィックス)

### React/Next.js
- ユーザーデータはクライアント側で完結するため、ストア操作は "use client" コンポーネントで行う
- 静的データ(優待マスタ等)の取得はServer Componentsで実施
- フォームは useState で状態を持つ(React Hook Form は未導入)
- エラーバウンダリを適切に配置

### コメント
- 日本語コメントOK
- なぜそうしているか(why)を書く、何をしているか(what)はコードから明らかなら不要
- 複雑な計算ロジックには必ず数式やロジックの説明を残す

### 命名
- 変数・関数: camelCase
- コンポーネント・型: PascalCase
- 定数: UPPER_SNAKE_CASE
- ファイル: kebab-case (例: stock-card.tsx) または PascalCase (コンポーネント)

## 重要な制約

### 法的境界
- 「投資助言」と取られる文言は絶対に使わない
- ❌「買うべき」「売るべき」「目標株価」「絶対」「確実」
- ⭕「過去データではこういう傾向」「シミュレーション結果はこちら」「判断材料」
- 全機能は「情報提供」のスタンスを徹底
- 利用規約に「投資判断はユーザー自身の責任」を必ず明記

### データ取り扱い
- ユーザーデータ(保有銘柄、ウォッチリスト、生活情報、設定)はすべてクライアント側に保存
- サーバーにユーザーデータは送信しない(プライバシー設計)
- 機密情報を含むデータはコミットしない(.env.localで管理)
- データのエクスポート/インポート機能(JSON)で機種変更・バックアップに対応

### 認証
- ユーザー認証は不要
- 各端末で独立してデータを保持
- 端末間同期は明示的なエクスポート/インポートのみ

### 通知設計
- 通知は重要度フィルタを必ず設ける(通知疲れ対策)
- 「冷静に判断してください」のメッセージを必ず添える
- パニック売りを誘発する文言は避ける
- デフォルトは控えめ、ユーザーが望めば増やせる設計

## ターゲットユーザー

- プライマリ: コスパ志向の中級個人投資家(30〜50代、世帯年収700〜1500万円)
- 投資経験あり、優待だけでなく株価変動も気にする層
- 桐谷さん的ヘビーユーザーではないが年間優待20〜50万円規模を狙う

## UI/UX 原則

- 情報過多を避ける(ヒックの法則)
- レイヤー設計: 初心者向け表示と詳細表示を切り替え可能に
- 信号機式アイコン(青/黄/赤)で直感的に状態を伝える
- 行動経済学的なフレーミングを意識(ゲイン提示、損失回避の打破)
- スマホ優先(PWA対応必須、オフラインでも基本機能は動作)
- ダークモード対応

## 将来のオプション機能(MVP後)

- **Claude API**: 銘柄解釈・生活マッチング強化などプレミアム機能。ユーザーが任意でAPIキーを入力して使用
- **通知配信**: LINE Notify等をユーザーが任意で設定して使用

## 開発進行ペース

- 開発者は本業との両立で副業として進行
- 週末数時間のペース
- 1機能完結ごとにコミット、デプロイ可能な状態を維持(コミット前に `npm run lint` / `npm run test` / `npm run build` を通す)
- ドキュメント・テストも徐々に整備

## ステージング戦略

- Month 1-2: 生活マッチング機能(MVP)
- Month 3: 保有ダッシュボード、ウォッチリスト
- Month 4: 株価データ、買い時スコア基本版
- Month 5: 通知機能、業績健全性評価
- Month 6: リカバリーシミュレーション
- Month 7: TDnet監視、優待変更速報
- Month 8: 行動経済学レイヤー、Claude API統合深化
- Month 9: クローズドβ
- Month 11: 一般公開
