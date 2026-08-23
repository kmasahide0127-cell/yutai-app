# データ取得スクリプト (Stage 1)

J-Quants API V2 を使って株式データ(銘柄一覧・株価・財務・配当)を取得する Python スクリプト群。

## 前提条件

- Python 3.10+
- J-Quants アカウントと API キー ([登録はこちら](https://application.jpx-jquants.com/))

## セットアップ

```bash
# 1. 依存パッケージのインストール
cd scripts
pip install -r requirements.txt

# 2. scripts/.env を作成(コミットされない)
cp .env.example .env
# .env を開いて JQUANTS_API_KEY に実際のキーを設定
```

`scripts/.env` の内容:
```
JQUANTS_API_KEY=取得したAPIキーをここに貼る
```

> **注意**: `scripts/.env` は `.gitignore` に含まれています。絶対にコミットしないでください。

## 各スクリプトの実行

`scripts/` ディレクトリから実行します。

```bash
cd scripts

# 上場銘柄一覧を取得 → output/listed.json
python -m fetch.fetch_listed

# 株価データを取得(デフォルト: 先頭10銘柄で動作確認)
python -m fetch.fetch_prices

# 株価データを全銘柄取得(時間がかかる)
python -m fetch.fetch_prices --limit 0

# 財務・配当データを取得(デフォルト: 先頭10銘柄)
python -m fetch.fetch_financials

# 財務・配当データを全銘柄取得
python -m fetch.fetch_financials --limit 0
```

## 無料プランの制約

| 制約 | 内容 |
|---|---|
| データ遅延 | **12週間(84日)** の遅延あり |
| 株主優待データ | **含まれない** (別途取得が必要) |
| 取得可能データ | 銘柄一覧・株価・財務・配当のみ |

> 例: 今日が2026年5月28日の場合、取得できる最新データは約2026年3月上旬まで。

## 出力ファイル

`scripts/output/` に保存されます(`.gitignore` で除外済み)。

| ファイル | 内容 |
|---|---|
| `listed.json` | 上場銘柄一覧 (コード・社名・業種・市場区分) |
| `prices.json` | 株価日足 (始値・高値・安値・終値・出来高) |
| `financials.json` | 財務情報(EPS等) + 配当情報 |

## 週次自動更新(GitHub Actions)

`.github/workflows/weekly-data-update.yml` が毎週日曜21:00 JSTに自動実行される
(手動実行は Actions タブから workflow_dispatch でも可能)。APIキーは不要
(yfinance・やのしんTDnet WEB-APIともに無料・無認証のため、GitHub Secretsの設定は不要)。

1. `fetch.update_stock_prices` で全銘柄の現在株価を取得し、`yutai-data.ts` の
   `approxInvestment`/`yieldPercent`/`priceUpdatedAt` を更新(優待「内容」やlastVerifiedには触れない)
2. `fetch.check_yutai_disclosures` で直近1週間のTDnet適時開示から「優待」を含む
   開示を検出し、PR本文で報告(内容は自動反映しない。人間またはClaudeセッションが
   開示資料を読んで `yutai-data.ts` を手動修正する)
3. 変更を Pull Request として作成(直接 main へはpushしない。price_update_summary.md
   や検出された開示一覧はPR本文に記載され、マージ前にレビューできる)

上記だけではカバーしきれない「TDnetに載らない/優待というキーワードを含まない」
変更の見落とし対策として、`WEEKLY_MAINTENANCE.md` の手動ローテーション確認も
引き続き併用する。

## Stage 2 以降の予定

- **Stage 2**: 株主優待データの取得 (J-Quants には含まれないため別ソースを検討)
  - 候補: スクレイピング, 手動CSV管理, 別APIサービス
- **Stage 3**: 取得データを `public/data/` 向けに変換・マージ
- ~~**Stage 4**: GitHub Actions でのスケジュール自動実行~~ → 実装済み(株価更新+優待変更検出、上記参照)

## ファイル構成

```
scripts/
├── requirements.txt              # 依存パッケージ
├── README.md                     # このファイル
├── output/                       # 取得データの出力先 (.gitignore 対象)
│   ├── listed.json
│   ├── prices.json
│   ├── financials.json
│   ├── price_update_summary.md
│   └── yutai_disclosure_report.md
└── fetch/
    ├── __init__.py
    ├── client.py                    # ClientV2 初期化
    ├── fetch_listed.py               # 上場銘柄一覧
    ├── fetch_prices.py               # 株価日足
    ├── fetch_financials.py           # 財務・配当
    ├── update_stock_prices.py        # yutai-data.ts の株価を自動更新(週次実行対象)
    └── check_yutai_disclosures.py    # TDnetから優待関連開示を検出(週次実行対象)
```
