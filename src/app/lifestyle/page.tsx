"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { getAllBrands, getAllLifestyleTags } from "@/lib/matching";
import { YUTAI_LIST } from "@/lib/yutai-data";

const ALL_BRANDS = getAllBrands(YUTAI_LIST);
const ALL_TAGS = getAllLifestyleTags(YUTAI_LIST);

export default function LifestylePage() {
  const router = useRouter();
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [maxInvestment, setMaxInvestment] = useState("");

  const hasSelection = selectedBrands.length > 0 || selectedTags.length > 0;

  const toggleBrand = (brand: string, checked: boolean) => {
    setSelectedBrands((prev) =>
      checked ? [...prev, brand] : prev.filter((b) => b !== brand)
    );
  };

  const toggleTag = (tag: string, checked: boolean) => {
    setSelectedTags((prev) =>
      checked ? [...prev, tag] : prev.filter((t) => t !== tag)
    );
  };

  const handleSubmit = () => {
    const params = new URLSearchParams();
    if (selectedBrands.length > 0) params.set("brands", selectedBrands.join(","));
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
    if (maxInvestment) params.set("maxInvestment", maxInvestment);
    router.push(`/results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="text-center space-y-1">
          <h1 className="text-2xl font-bold">あなたの生活を教えてください</h1>
          <p className="text-sm text-muted-foreground">
            使っているブランドやライフスタイルから、合う株主優待を見つけます
          </p>
        </header>

        {/* ブランド選択 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">使っているブランド</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ALL_BRANDS.map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={(checked) => toggleBrand(brand, !!checked)}
                />
                <span className="text-sm leading-tight">{brand}</span>
              </label>
            ))}
          </div>
        </section>

        {/* ライフスタイル選択 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">あてはまるライフスタイル</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ALL_TAGS.map((tag) => (
              <label
                key={tag}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={(checked) => toggleTag(tag, !!checked)}
                />
                <span className="text-sm">{tag}</span>
              </label>
            ))}
          </div>
        </section>

        {/* 投資可能額 */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">投資可能額の上限(任意)</h2>
          <p className="text-sm text-muted-foreground">空欄の場合は金額制限なし</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={maxInvestment}
              onChange={(e) => setMaxInvestment(e.target.value)}
              placeholder="例: 300000"
              min={0}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
            />
            <span className="text-sm text-muted-foreground shrink-0">円</span>
          </div>
        </section>

        {/* 送信ボタン */}
        <div className="pb-8 space-y-2">
          <Button
            size="lg"
            className="w-full"
            disabled={!hasSelection}
            onClick={handleSubmit}
          >
            結果を見る
          </Button>
          {!hasSelection && (
            <p className="text-center text-xs text-muted-foreground">
              ブランドまたはライフスタイルを1つ以上選択してください
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
