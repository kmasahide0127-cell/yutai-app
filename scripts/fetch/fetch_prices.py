"""株価データ(日足)を取得して scripts/output/prices.json に保存する。

無料プランは12週間(84日)遅延のため、取得可能な最新日は「今日 - 84日」。
デフォルトでは直近30日分を取得する。

使用例:
    # 10銘柄で動作確認(デフォルト)
    python -m fetch.fetch_prices

    # 50銘柄
    python -m fetch.fetch_prices --limit 50

    # 全銘柄(時間がかかる)
    python -m fetch.fetch_prices --limit 0
"""

import argparse
import json
from datetime import datetime, timedelta
from pathlib import Path

from .client import get_client

OUTPUT_PATH = Path(__file__).parent.parent / "output" / "prices.json"

# 無料プランの遅延日数
_FREE_PLAN_DELAY_DAYS = 84  # 12週間

# 1回の取得期間(日数)
_FETCH_DAYS = 30


def fetch_prices(limit: int = 10) -> list[dict]:
    """
    J-Quants V2 から株価日足を取得し JSON に保存する。

    Args:
        limit: 取得銘柄数の上限 (0 = 全件)

    Returns:
        取得したレコードのリスト
    """
    client = get_client()

    end_dt = datetime.now() - timedelta(days=_FREE_PLAN_DELAY_DAYS)
    start_dt = end_dt - timedelta(days=_FETCH_DAYS)

    print(
        f"株価データを取得中 "
        f"({start_dt.strftime('%Y-%m-%d')} 〜 {end_dt.strftime('%Y-%m-%d')})..."
    )
    if limit > 0:
        print(f"  ※ 件数制限: 先頭 {limit} 銘柄")

    df = client.get_eq_bars_daily_range(
        start_dt=start_dt.strftime("%Y%m%d"),
        end_dt=end_dt.strftime("%Y%m%d"),
    )

    if df.empty:
        print("警告: データが空です。APIキーの権限またはプランを確認してください。")
        return []

    if limit > 0:
        target_codes = df["Code"].unique()[:limit]
        df = df[df["Code"].isin(target_codes)]

    # 存在する列だけに絞る
    keep_cols = [
        c for c in
        ["Code", "Date", "Open", "High", "Low", "Close", "Volume",
         "TurnoverValue", "AdjustmentFactor", "AdjustmentClose"]
        if c in df.columns
    ]
    df = df[keep_cols].sort_values(["Code", "Date"])

    records = df.to_dict(orient="records")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

    unique_codes = df["Code"].nunique()
    print(f"取得完了: {unique_codes}銘柄 × {len(records)}レコード → {OUTPUT_PATH}")
    return records


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="株価データ(日足)を取得する")
    parser.add_argument(
        "--limit",
        type=int,
        default=10,
        help="取得銘柄数の上限 (0=全件, デフォルト=10)",
    )
    args = parser.parse_args()
    fetch_prices(limit=args.limit)
