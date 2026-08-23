"""直近1週間のTDnet適時開示情報から、YUTAI_LIST内の銘柄に関する
株主優待関連の開示(改定・廃止・新設など)がないかを検出するスクリプト。

やのしんTDnet WEB-API(非公式・無料・APIキー不要)を使う:
    https://webapi.yanoshin.jp/tdnet/

このスクリプトは内容の自動反映は行わない。「優待」という語を含む
タイトルの開示を機械的に抽出して報告するだけで、実際に yutai-data.ts
の内容(description・annualValue等)を書き換えるかどうかは人間(または
別途Claudeセッション)がリンク先の開示資料を読んで判断する。
理由: 優待の改定内容はPDF本文を読まないと正確に把握できず、誤った
自動反映は「誤情報の掲載」という実害に直結するため。

使用例:
    python -m fetch.check_yutai_disclosures
    python -m fetch.check_yutai_disclosures --days 10
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from datetime import date, timedelta
from pathlib import Path

YUTAI_DATA_PATH = Path(__file__).parent.parent.parent / "src" / "lib" / "yutai-data.ts"
REPORT_PATH = Path(__file__).parent.parent / "output" / "yutai_disclosure_report.md"

API_BASE = "https://webapi.yanoshin.jp/webapi/tdnet/list"
REQUEST_LIMIT = 5000  # 1週間分(通常800〜1000件程度)には十分な上限
REQUEST_TIMEOUT_SECONDS = 30

# タイトルにこのいずれかを含む開示を「優待関連」とみなす
YUTAI_KEYWORDS = ["優待"]


def load_codes_and_names() -> dict[str, str]:
    """yutai-data.ts から {証券コード(4桁): 銘柄名} を抽出する。"""
    content = YUTAI_DATA_PATH.read_text(encoding="utf-8")
    entry_re = re.compile(r'^\s*\{\s*id:')
    result: dict[str, str] = {}
    for line in content.splitlines():
        if not entry_re.match(line):
            continue
        m_code = re.search(r'code: "([^"]+)"', line)
        m_name = re.search(r'name: "([^"]+)"', line)
        if m_code and m_name:
            result[m_code.group(1)] = m_name.group(1)
    return result


def fetch_disclosures(start: date, end: date) -> list[dict]:
    """指定期間のTDnet適時開示情報を取得する。取得失敗時は例外を投げる。"""
    url = (
        f"{API_BASE}/{start.strftime('%Y%m%d')}-{end.strftime('%Y%m%d')}.json"
        f"?limit={REQUEST_LIMIT}"
    )
    req = urllib.request.Request(url, headers={"User-Agent": "yutai-app-weekly-check/1.0"})
    with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT_SECONDS) as res:
        data = json.load(res)
    return data.get("items", [])


def main() -> int:
    parser = argparse.ArgumentParser(description="優待関連のTDnet適時開示を検出する")
    parser.add_argument("--days", type=int, default=7, help="何日前まで遡って確認するか(デフォルト: 7)")
    args = parser.parse_args()

    codes = load_codes_and_names()
    end = date.today()
    start = end - timedelta(days=args.days)

    try:
        items = fetch_disclosures(start, end)
        fetch_error: str | None = None
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
        items = []
        fetch_error = str(e)

    hits: list[tuple[str, str, dict]] = []
    for item in items:
        rec = item.get("Tdnet", item)
        title = rec.get("title", "")
        if not any(k in title for k in YUTAI_KEYWORDS):
            continue
        # やのしんAPIの company_code は5桁(末尾0埋め等)なので先頭4桁で照合する
        raw_code = rec.get("company_code", "")
        code4 = raw_code[:4]
        if code4 not in codes:
            continue
        hits.append((code4, codes[code4], rec))

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    lines: list[str] = []
    lines.append(f"## 優待関連の適時開示チェック({start.isoformat()} 〜 {end.isoformat()})\n")

    if fetch_error:
        lines.append(f"⚠️ TDnet情報の取得に失敗しました: {fetch_error}\n")
        lines.append("(株価の自動更新には影響ありません。次回の実行で再取得を試みます)\n")
    elif not hits:
        lines.append(f"該当する開示なし(確認件数: {len(items)}件)\n")
    else:
        lines.append(f"YUTAI_LIST内銘柄の「優待」を含む開示が {len(hits)} 件見つかりました。")
        lines.append("内容を確認し、変更があれば yutai-data.ts を手動で更新してください。\n")
        for code4, name, rec in sorted(hits, key=lambda h: h[2].get("pubdate", ""), reverse=True):
            pubdate = rec.get("pubdate", "?")
            title = rec.get("title", "?")
            doc_url = rec.get("document_url", "")
            lines.append(f"- **{name}({code4})** [{pubdate}] {title}")
            if doc_url:
                lines.append(f"  {doc_url}")

    report = "\n".join(lines) + "\n"
    REPORT_PATH.write_text(report, encoding="utf-8")
    print(report, file=sys.stderr)

    return 0


if __name__ == "__main__":
    sys.exit(main())
