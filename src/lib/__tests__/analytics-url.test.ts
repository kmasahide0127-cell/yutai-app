import { describe, expect, it } from "vitest";
import {
  SANITIZE_ANALYTICS_URL_JS,
  buildGaInitScript,
  sanitizeAnalyticsUrl,
} from "@/lib/analytics-url";

const ORIGIN = "https://yutai-match.com";

// インラインスクリプトに埋め込む JS 版も、TS 版と同じケースで同じ結果になることを保証する
const inlineSanitize = new Function(`return (${SANITIZE_ANALYTICS_URL_JS});`)() as (
  rawUrl: string
) => string;

const IMPLEMENTATIONS = [
  ["sanitizeAnalyticsUrl", sanitizeAnalyticsUrl],
  ["SANITIZE_ANALYTICS_URL_JS", inlineSanitize],
] as const;

describe.each(IMPLEMENTATIONS)("%s", (_name, sanitize) => {
  it("マッチング条件のパラメータを名前ごと除去する", () => {
    const url = `${ORIGIN}/results?expenses=食費,外食&maxInvestment=300000&household=3&vehicleType=gasoline&preferenceTags=cafe&totalBudget=1000000&planYears=5`;
    expect(sanitize(url)).toBe(`${ORIGIN}/results`);
  });

  it("検索語・体験の興味・絞り込み条件・オンボーディングの段階を除去する", () => {
    expect(sanitize(`${ORIGIN}/search?q=${encodeURIComponent("スターバックス")}`)).toBe(`${ORIGIN}/search`);
    expect(sanitize(`${ORIGIN}/experiences?exp_golf=want&maxInvestment=500000&sort=amount`)).toBe(`${ORIGIN}/experiences`);
    expect(sanitize(`${ORIGIN}/stocks?expense=food&month=3&category=gourmet`)).toBe(`${ORIGIN}/stocks`);
    expect(sanitize(`${ORIGIN}/onboarding?step=2`)).toBe(`${ORIGIN}/onboarding`);
    expect(sanitize(`${ORIGIN}/lifestyle?brands=a,b&tags=x`)).toBe(`${ORIGIN}/lifestyle`);
  });

  it("utm_* パラメータは保持し、それ以外は除去する", () => {
    const url = `${ORIGIN}/results?utm_source=x&expenses=食費&utm_medium=social&q=secret&utm_campaign=launch`;
    expect(sanitize(url)).toBe(`${ORIGIN}/results?utm_source=x&utm_medium=social&utm_campaign=launch`);
  });

  it("utm_ で始まらない似た名前のパラメータは除去する", () => {
    expect(sanitize(`${ORIGIN}/?utmsource=x&my_utm_source=y&gclid=z`)).toBe(`${ORIGIN}/`);
  });

  it("# 以降を除去する", () => {
    expect(sanitize(`${ORIGIN}/method#yield`)).toBe(`${ORIGIN}/method`);
    expect(sanitize(`${ORIGIN}/results?expenses=食費&utm_source=x#calendar`)).toBe(`${ORIGIN}/results?utm_source=x`);
    // # の中に ? や utm_ があってもクエリとして扱わない
    expect(sanitize(`${ORIGIN}/search#?q=secret&utm_source=x`)).toBe(`${ORIGIN}/search`);
  });

  it("パス部分はそのまま残す", () => {
    expect(sanitize(`${ORIGIN}/stocks/2702?from=list`)).toBe(`${ORIGIN}/stocks/2702`);
    expect(sanitize(`${ORIGIN}/expense/food`)).toBe(`${ORIGIN}/expense/food`);
  });

  it("空文字や URL として解釈できない値は空文字を返す", () => {
    expect(sanitize("")).toBe("");
    expect(sanitize("not a url")).toBe("");
  });

  it("外部の参照元もパス + utm_* に揃える", () => {
    expect(sanitize("https://www.google.com/search?q=株主優待")).toBe("https://www.google.com/search");
  });
});

describe("buildGaInitScript", () => {
  it("自動 page_view を止め、サニタイズ済みの URL で config する", () => {
    const fakeWindow: { dataLayer?: unknown[] } = {};
    const run = new Function("window", "location", "document", buildGaInitScript("G-TEST123"));
    run(
      fakeWindow,
      { href: `${ORIGIN}/results?expenses=食費&utm_source=x#calendar` },
      { referrer: `${ORIGIN}/search?q=secret` }
    );

    const commands = (fakeWindow.dataLayer ?? []).map((args) => Array.from(args as ArrayLike<unknown>));
    expect(commands.map((c) => c[0])).toEqual(["js", "config"]);
    expect(commands[1]).toEqual([
      "config",
      "G-TEST123",
      {
        send_page_view: false,
        page_location: `${ORIGIN}/results?utm_source=x`,
        page_referrer: `${ORIGIN}/search`,
      },
    ]);
  });
});
