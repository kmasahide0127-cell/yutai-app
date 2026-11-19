// 実データ(brand-data.ts / yutai-data.ts)に対する確認。
// 件数や並び順はデータ更新で変わるため、ここでは「壊れていたら利用者に見える」ことだけを確かめる。
import { describe, expect, it } from "vitest";
import { BRAND_RETAILER_LINKS, BRANDS, RETAILERS } from "@/lib/brand-data";
import { SEARCH_EXAMPLES, searchProducts } from "@/lib/product-search";
import { YUTAI_LIST } from "@/lib/yutai-data";

describe("商品名検索(実データ)", () => {
  // 検索欄の例として画面に出している語が0件になると、例を押した利用者が空振りする
  it.each(SEARCH_EXAMPLES)("検索例「%s」で結果が返る", (example) => {
    expect(searchProducts(example).hasAnyResult).toBe(true);
  });

  it("ブランド辞書の証券コード・小売コードが銘柄データに存在する", () => {
    const codes = new Set(YUTAI_LIST.map((y) => y.code));
    const brandIds = new Set(BRANDS.map((b) => b.id));
    const retailerCodes = new Set(RETAILERS.map((r) => r.code));

    // 上場ブランドの ticker が未収録なのは「収録なし」として正しく扱われるので許容し、
    // 小売の導線(RETAILERS / BRAND_RETAILER_LINKS)は参照切れがあると導線が黙って消えるため検査する
    expect(RETAILERS.filter((r) => !codes.has(r.code)).map((r) => r.code)).toEqual([]);
    expect(
      BRAND_RETAILER_LINKS.filter((l) => !brandIds.has(l.brandId) || !retailerCodes.has(l.retailerCode))
    ).toEqual([]);
  });
});
