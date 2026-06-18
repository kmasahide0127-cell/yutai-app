import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import {
  filterCandidatesForBudget,
  buildBudgetAwareCalendarPackage,
  PREFERENCE_TAGS,
  type ExpenseCategory,
  type PreferenceTag,
  type UserExpenseLifestyle,
} from "@/lib/matching";
import { YUTAI_LIST } from "@/lib/yutai-data";

export const dynamic = "force-dynamic";

const VALID_TAG_IDS = new Set(
  Object.values(PREFERENCE_TAGS).flat().map((t) => t.id)
);

// Google Fonts CSS API から Noto Sans JP のサブセット(TTF)を取得
// Satori/vercel-og は TTF/OTF のみ対応。woff2 は非対応なので古い UA を使う
async function fetchJapaneseFont(): Promise<ArrayBuffer | null> {
  try {
    const chars = encodeURIComponent(
      "生活から株主優待を逆引き私の年間カレンダー銘柄ヶ月バー利回り件該当なし0123456789%"
    );
    const cssRes = await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${chars}&display=swap`,
      // UA を指定しないか、古いブラウザ UA にすると truetype(TTF) 形式が返る
      { headers: { "User-Agent": "Mozilla/4.0" } }
    );
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    // format('truetype') の URL を抽出
    const match = css.match(/src:\s*url\(([^)]+)\)\s*format\('truetype'\)/);
    if (!match) {
      // フォールバック: format 問わず最初の url() を取得
      const fallback = css.match(/src:\s*url\(([^)]+)\)/);
      if (!fallback) return null;
      const fontRes = await fetch(fallback[1]);
      if (!fontRes.ok) return null;
      return fontRes.arrayBuffer();
    }
    const fontRes = await fetch(match[1]);
    if (!fontRes.ok) return null;
    return fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

// Satori 制約:
//   - 複数の子を持つ要素は必ず display:"flex"
//   - テキストと変数の混在は文字列テンプレートで結合
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const expensesParam = searchParams.get("expenses") ?? "";
  const maxParam = searchParams.get("maxInvestment");
  const vehicleTypeParam = searchParams.get("vehicleType");
  const preferenceTagsParam = searchParams.get("preferenceTags") ?? "";

  const expenseCategories = expensesParam
    .split(",")
    .filter(Boolean) as ExpenseCategory[];

  const rawMax = maxParam ? parseInt(maxParam, 10) : 500000;
  const budget = isNaN(rawMax) || rawMax <= 0 ? 500000 : rawMax;

  const preferenceTags = preferenceTagsParam
    .split(",")
    .filter(Boolean)
    .filter((id): id is PreferenceTag => VALID_TAG_IDS.has(id as PreferenceTag));

  const lifestyle: UserExpenseLifestyle = {
    expenseCategories,
    brands: [],
    maxInvestment: budget,
  };

  let confirmedYutaiCount = 0;
  let confirmedMonthCount = 0;
  let confirmedYield = 0;

  try {
    const candidates = filterCandidatesForBudget(lifestyle, YUTAI_LIST);
    const filtered =
      vehicleTypeParam === "ev"
        ? candidates.filter((y) => {
            const kw = ["ENEOS", "エネオス", "apollostation", "出光", "昭和シェル", "コスモ石油"];
            return !(
              y.brands.some((b) => kw.some((k) => b.includes(k))) ||
              y.description.includes("給油")
            );
          })
        : candidates;

    const pkg = buildBudgetAwareCalendarPackage(filtered, budget, preferenceTags);
    confirmedYutaiCount = pkg.confirmedYutaiCount;
    confirmedMonthCount = pkg.confirmedMonthCount;
    confirmedYield = pkg.confirmedYield;
  } catch (e) {
    console.error("[og] matching error:", e);
  }

  const fontData = await fetchJapaneseFont();
  const fonts = fontData
    ? [{ name: "NotoSansJP", data: fontData, weight: 700 as const, style: "normal" as const }]
    : [];
  const fontFamily = fontData ? "NotoSansJP" : "sans-serif";

  const hasResult = confirmedYutaiCount > 0;

  // 文字列はすべてテンプレートリテラルで結合(Satori での複数テキストノード回避)
  const countStr = `${confirmedYutaiCount}`;
  const monthStr = `${confirmedMonthCount}`;
  const yieldStr = `${confirmedYield.toFixed(1)}%`;

  // カード共通スタイル
  const card: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E1C0E",
    border: "1px solid #5C3D22",
    borderRadius: "16px",
    padding: "28px 40px",
    flex: 1,
    gap: "10px",
  };
  const cardNum: React.CSSProperties = {
    display: "flex",
    fontSize: "64px",
    fontWeight: 700,
    color: "#C8916A",
    lineHeight: 1,
    fontFamily,
  };
  const cardLabel: React.CSSProperties = {
    display: "flex",
    fontSize: "20px",
    color: "#A08060",
    fontFamily,
  };

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "1200px",
          height: "630px",
          backgroundColor: "#1E1208",
          fontFamily,
          color: "#F2E8D9",
          position: "relative",
        }}
      >
        {/* 左端アクセントライン */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "6px",
            height: "630px",
            backgroundColor: "#C8916A",
          }}
        />

        {/* 余白コンテナ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "52px 72px 48px 80px",
            gap: "0px",
          }}
        >
          {/* ヘッダー */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "14px",
                color: "#C8916A",
                letterSpacing: "5px",
                fontWeight: 700,
                fontFamily,
              }}
            >
              株主優待マッチング
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "44px",
                fontWeight: 700,
                lineHeight: 1.2,
                color: "#F2E8D9",
                fontFamily,
              }}
            >
              生活から、株主優待を逆引き
            </div>
          </div>

          {/* 仕切り線 */}
          <div
            style={{
              display: "flex",
              height: "1px",
              backgroundColor: "#5C3D22",
              marginBottom: "32px",
            }}
          />

          {/* メイン */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "22px",
                color: "#A08060",
                fontWeight: 700,
                fontFamily,
              }}
            >
              私の年間優待カレンダー
            </div>

            {hasResult ? (
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  flex: 1,
                  alignItems: "stretch",
                }}
              >
                {/* 銘柄数 */}
                <div style={card}>
                  <div style={cardNum}>{countStr}</div>
                  <div style={cardLabel}>銘柄</div>
                </div>
                {/* カバー月数 */}
                <div style={card}>
                  <div style={cardNum}>{monthStr}</div>
                  <div style={cardLabel}>ヶ月カバー</div>
                </div>
                {/* 優待利回り */}
                <div style={card}>
                  <div style={cardNum}>{yieldStr}</div>
                  <div style={cardLabel}>優待利回り</div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#2E1C0E",
                  border: "1px solid #5C3D22",
                  borderRadius: "16px",
                  padding: "48px",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: "28px",
                    color: "#A08060",
                    fontFamily,
                  }}
                >
                  あなたの生活にマッチする優待を診断中
                </div>
              </div>
            )}
          </div>

          {/* フッター */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "15px",
                color: "#6B5040",
                fontFamily,
              }}
            >
              yutai-match.com
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "12px",
                color: "#4A3525",
                fontFamily,
              }}
            >
              情報提供のみ。投資判断はご自身でご確認ください。
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts }
  );
}
