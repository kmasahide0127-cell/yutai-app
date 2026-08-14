"""src/lib/yutai-data.ts 内の全銘柄の現在株価を取得し、
approxInvestment・yieldPercent・priceUpdatedAt を更新するスクリプト。

J-Quants無料プランは84日遅延があり「現在の株価」取得には不向きなため、
ここでは yfinance を使う(CLAUDE.md記載のPythonバッチ方針に準拠)。

このスクリプトは金額の桁が大きく変わるような「上場廃止」「証券コードの
誤り」等の判断は行わない(人間によるレビューが必要なため)。取得に失敗
した銘柄は変更せずそのまま残し、失敗一覧を出力するだけに留める。

重要: lastVerified(優待「内容」を一次情報で確認した日)は絶対に書き
換えない。株価の更新は内容の再検証を意味しないため、priceUpdatedAt
という別フィールドにのみ反映する。過去、この区別を怠ったために
「本日検証済み」であるかのような誤ったシグナルを与えてしまったことが
ある(2026-08-14、楽天グループ・KDDI等で発覚)。

使用例:
    python -m fetch.update_stock_prices
"""

from __future__ import annotations

import re
import sys
from datetime import date, timedelta
from pathlib import Path

import yfinance as yf

YUTAI_DATA_PATH = Path(__file__).parent.parent.parent / "src" / "lib" / "yutai-data.ts"

# 通常の東証銘柄は ".T"。9942(ジョイフル)のみ福証上場のため ".F"。
EXCHANGE_SUFFIX_OVERRIDES: dict[str, str] = {
    "9942": ".F",
}

# 1回のリトライ間隔(秒)。Yahoo Finance側のレート制限対策。
RETRY_COUNT = 3
RETRY_SLEEP_SECONDS = 2

# 前回比でこの割合以上動いた場合はPR本文で注意喚起する(自動ブロックはしない)
LARGE_CHANGE_THRESHOLD = 0.2


def fetch_price(code: str) -> float | None:
    import time

    suffix = EXCHANGE_SUFFIX_OVERRIDES.get(code, ".T")
    ticker = f"{code}{suffix}"
    for attempt in range(RETRY_COUNT):
        try:
            price = yf.Ticker(ticker).fast_info.last_price
            if price and price > 0:
                return float(price)
        except Exception:
            pass
        if attempt < RETRY_COUNT - 1:
            time.sleep(RETRY_SLEEP_SECONDS)
    return None


def main() -> int:
    content = YUTAI_DATA_PATH.read_text(encoding="utf-8")
    lines = content.splitlines(keepends=True)

    today = date.today().isoformat()
    entry_re = re.compile(r'^\s*\{\s*id:')

    codes: list[str] = []
    for line in lines:
        if not entry_re.match(line):
            continue
        m = re.search(r'code: "([^"]+)"', line)
        if m:
            codes.append(m.group(1))
    unique_codes = list(dict.fromkeys(codes))

    print(f"{len(unique_codes)}銘柄の株価を取得します...", file=sys.stderr)
    prices: dict[str, float] = {}
    failed: list[str] = []
    for i, code in enumerate(unique_codes):
        price = fetch_price(code)
        if price is not None:
            prices[code] = price
        else:
            failed.append(code)
        if (i + 1) % 25 == 0:
            print(f"  {i + 1}/{len(unique_codes)} 件処理済み", file=sys.stderr)

    updated_names: list[str] = []
    large_changes: list[str] = []
    out_lines: list[str] = []

    for line in lines:
        if not entry_re.match(line):
            out_lines.append(line)
            continue

        m_code = re.search(r'code: "([^"]+)"', line)
        price = prices.get(m_code.group(1)) if m_code else None
        if price is None:
            out_lines.append(line)
            continue

        m_name = re.search(r'name: "([^"]+)"', line)
        m_shares = re.search(r"minShares: (\d+)", line)
        m_annual = re.search(r"annualValue: (\d+)", line)
        m_investment = re.search(r"approxInvestment: (\d+)", line)
        if not (m_name and m_shares and m_annual and m_investment):
            out_lines.append(line)
            continue

        min_shares = int(m_shares.group(1))
        annual_value = int(m_annual.group(1))
        old_investment = int(m_investment.group(1))
        new_investment = round(price * min_shares)

        if old_investment > 0:
            change = abs(new_investment - old_investment) / old_investment
            if change >= LARGE_CHANGE_THRESHOLD:
                large_changes.append(
                    f"{m_name.group(1)}({m_code.group(1)}): "
                    f"{old_investment:,}円 → {new_investment:,}円 ({change * 100:.0f}%変動)"
                )

        new_yield = (
            round(annual_value / new_investment * 100, 1)
            if new_investment > 0 and annual_value > 0
            else 0.0
        )

        new_line = line
        new_line = re.sub(r"approxInvestment: \d+", f"approxInvestment: {new_investment}", new_line, count=1)
        new_line = re.sub(r"yieldPercent: [\d.]+", f"yieldPercent: {new_yield}", new_line, count=1)
        # lastVerified(内容の検証日)には触れない。priceUpdatedAt のみ更新/追加する。
        if re.search(r'priceUpdatedAt: "[\d-]+"', new_line):
            new_line = re.sub(r'priceUpdatedAt: "[\d-]+"', f'priceUpdatedAt: "{today}"', new_line, count=1)
        else:
            new_line = re.sub(r'(lastVerified: "[\d-]+")', rf'\1, priceUpdatedAt: "{today}"', new_line, count=1)
        out_lines.append(new_line)
        updated_names.append(m_name.group(1))

    new_content = "".join(out_lines)
    new_content = re.sub(
        r'export const DATA_LAST_UPDATED = "[\d-]+";',
        f'export const DATA_LAST_UPDATED = "{today}";',
        new_content,
        count=1,
    )
    YUTAI_DATA_PATH.write_text(new_content, encoding="utf-8")

    print(f"更新: {len(updated_names)}銘柄", file=sys.stderr)
    print(f"取得失敗(変更なし): {len(failed)}銘柄", file=sys.stderr)

    summary_path = Path(__file__).parent.parent / "output" / "price_update_summary.md"
    summary_path.parent.mkdir(parents=True, exist_ok=True)
    with open(summary_path, "w", encoding="utf-8") as f:
        f.write(f"## 株価自動更新サマリー({today})\n\n")
        f.write(f"- 更新: {len(updated_names)}銘柄\n")
        f.write(f"- 取得失敗(変更なし): {len(failed)}銘柄\n\n")
        if large_changes:
            f.write(f"### ⚠️ 前回比{int(LARGE_CHANGE_THRESHOLD * 100)}%以上動いた銘柄(要確認)\n\n")
            for line in large_changes:
                f.write(f"- {line}\n")
            f.write("\n")
        if failed:
            f.write("### 取得失敗した銘柄コード(上場廃止・コード変更の可能性、要確認)\n\n")
            f.write(", ".join(failed) + "\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
