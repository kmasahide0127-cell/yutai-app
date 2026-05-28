"""上場銘柄一覧を取得して scripts/output/listed.json に保存する。"""

import json
from pathlib import Path

from .client import get_client

OUTPUT_PATH = Path(__file__).parent.parent / "output" / "listed.json"

# get_list() が返す列のうち保持するもの
# V2フィールド名: Code, CoName, CoNameEn, S17, S17Nm, S33, S33Nm, ScaleCat, Mkt, MktNm
_KEEP_COLS = ["Code", "CoName", "CoNameEn", "S17Nm", "S33Nm", "ScaleCat", "MktNm"]


def fetch_listed() -> list[dict]:
    """
    J-Quants V2 から上場銘柄一覧を取得し JSON に保存する。

    Returns:
        取得した銘柄レコードのリスト
    """
    client = get_client()
    print("上場銘柄一覧を取得中...")

    df = client.get_list()

    if df.empty:
        print("警告: データが空です。APIキーの権限またはプランを確認してください。")
        return []

    # 存在する列だけに絞る(プランによって列が異なる可能性)
    cols = [c for c in _KEEP_COLS if c in df.columns]
    df = df[cols].copy()

    records = df.to_dict(orient="records")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

    print(f"取得完了: {len(records)}銘柄 → {OUTPUT_PATH}")
    return records


if __name__ == "__main__":
    fetch_listed()
