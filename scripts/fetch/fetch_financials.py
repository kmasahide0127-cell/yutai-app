"""財務情報(EPS等)と配当情報を取得して scripts/output/financials.json に保存する。

無料プランは12週間(84日)遅延のため、取得可能な最新日は「今日 - 84日」。
財務情報は直近1年分、配当情報は直近6ヶ月分を取得する。

使用例:
    # 10銘柄で動作確認(デフォルト)
    python -m fetch.fetch_financials

    # 全銘柄
    python -m fetch.fetch_financials --limit 0
"""

import argparse
import json
from datetime import datetime, timedelta
from pathlib import Path

from .client import get_client

OUTPUT_PATH = Path(__file__).parent.parent / "output" / "financials.json"

_FREE_PLAN_DELAY_DAYS = 84  # 12週間


def fetch_financials(limit: int = 10) -> dict:
    """
    J-Quants V2 から財務情報と配当情報を取得し JSON に保存する。

    Args:
        limit: 取得銘柄数の上限 (0 = 全件)

    Returns:
        {"financials": [...], "dividends": [...], "fetched_at": "..."} の辞書
    """
    client = get_client()

    end_dt = datetime.now() - timedelta(days=_FREE_PLAN_DELAY_DAYS)

    # ── 財務情報(直近1年) ──────────────────────────────────────────
    fin_start = end_dt - timedelta(days=365)
    print(
        f"財務情報を取得中 "
        f"({fin_start.strftime('%Y-%m-%d')} 〜 {end_dt.strftime('%Y-%m-%d')})..."
    )

    df_fin = client.get_fin_summary_range(
        start_dt=fin_start.strftime("%Y%m%d"),
        end_dt=end_dt.strftime("%Y%m%d"),
    )

    fin_codes: list[str] = []
    if not df_fin.empty and "Code" in df_fin.columns:
        if limit > 0:
            fin_codes = list(df_fin["Code"].unique()[:limit])
            df_fin = df_fin[df_fin["Code"].isin(fin_codes)]
            print(f"  ※ 件数制限: {limit} 銘柄")
        else:
            fin_codes = list(df_fin["Code"].unique())

    # ── 配当情報(直近6ヶ月) ────────────────────────────────────────
    div_start = end_dt - timedelta(days=180)
    print(
        f"配当情報を取得中 "
        f"({div_start.strftime('%Y-%m-%d')} 〜 {end_dt.strftime('%Y-%m-%d')})..."
    )

    df_div = client.get_fin_dividend(
        from_yyyymmdd=div_start.strftime("%Y%m%d"),
        to_yyyymmdd=end_dt.strftime("%Y%m%d"),
    )

    # 財務と同じ銘柄に絞る(limit > 0 かつ財務が取れた場合)
    if not df_div.empty and "Code" in df_div.columns and fin_codes:
        df_div = df_div[df_div["Code"].isin(fin_codes)]

    result = {
        "financials": df_fin.to_dict(orient="records") if not df_fin.empty else [],
        "dividends": df_div.to_dict(orient="records") if not df_div.empty else [],
        "fetched_at": datetime.now().isoformat(),
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(
        f"取得完了: 財務 {len(result['financials'])} 件, "
        f"配当 {len(result['dividends'])} 件 → {OUTPUT_PATH}"
    )
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="財務・配当データを取得する")
    parser.add_argument(
        "--limit",
        type=int,
        default=10,
        help="取得銘柄数の上限 (0=全件, デフォルト=10)",
    )
    args = parser.parse_args()
    fetch_financials(limit=args.limit)
