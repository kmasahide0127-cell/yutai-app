"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { YUTAI_LIST } from "@/lib/yutai-data";
import type { Yutai } from "@/lib/yutai-data";
import {
  resolveHoldings,
  analyzeRightsMonthGaps,
  analyzeCategoryBias,
  analyzeRedundancy,
  suggestForGaps,
  type ResolvedHolding,
} from "@/lib/portfolio";
import { cn } from "@/lib/utils";

type HeldItem = {
  input: string;
  resolved: ResolvedHolding;
};

function searchYutai(query: string): Yutai[] {
  const lower = query.toLowerCase();
  return YUTAI_LIST.filter(
    (y) =>
      y.name.toLowerCase().includes(lower) ||
      y.code.includes(lower) ||
      y.brands.some((b) => b.toLowerCase().includes(lower))
  ).slice(0, 8);
}

export default function PortfolioPage() {
  const [query, setQuery] = useState("");
  const [held, setHeld] = useState<HeldItem[]>([]);
  const [suggestions, setSuggestions] = useState<Yutai[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [debugResult, setDebugResult] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim()) {
      setSuggestions(searchYutai(query));
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAlreadyHeld = useCallback(
    (code: string) => held.some((h) => h.resolved.found && h.resolved.yutai?.code === code),
    [held]
  );

  function addByYutai(yutai: Yutai) {
    if (isAlreadyHeld(yutai.code)) return;
    setHeld((prev) => [
      ...prev,
      { input: yutai.name, resolved: { input: yutai.name, found: true, yutai } },
    ]);
    setQuery("");
    setShowDropdown(false);
    inputRef.current?.focus();
  }

  function addByFreeText(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const [resolved] = resolveHoldings([trimmed]);
    if (resolved.found && resolved.yutai && isAlreadyHeld(resolved.yutai.code)) return;
    if (!resolved.found && held.some((h) => !h.resolved.found && h.input === trimmed)) return;
    setHeld((prev) => [...prev, { input: trimmed, resolved }]);
    setQuery("");
    setShowDropdown(false);
    inputRef.current?.focus();
  }

  function remove(index: number) {
    setHeld((prev) => prev.filter((_, i) => i !== index));
    setDebugResult(null);
  }

  function analyze() {
    const resolvedList = held.map((h) => h.resolved);
    const monthGaps = analyzeRightsMonthGaps(resolvedList);
    const categoryBias = analyzeCategoryBias(resolvedList);
    const redundancy = analyzeRedundancy(resolvedList);
    const gaps = suggestForGaps(resolvedList, YUTAI_LIST);
    const result = { monthGaps, categoryBias, redundancy, gaps };
    console.log("3軸分析結果:", result);
    setDebugResult(JSON.stringify(result, null, 2));
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="px-4 py-8 pb-20">
        <div className="mx-auto max-w-2xl space-y-6">

          {/* ヘッダー */}
          <div className="space-y-2">
            <Link href="/" className="text-xs text-muted-foreground hover:underline">
              ← トップに戻る
            </Link>
            <h1 className="text-xl font-bold">保有株を分析する</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              お持ちの株を入力すると、優待の偏りや、まだ手をつけていないジャンルを分析します。
              主要な2〜3銘柄だけでも分析できます。
            </p>
          </div>

          {/* 銘柄入力 */}
          <div className="space-y-2">
            <p className="text-sm font-medium">銘柄を追加</p>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) {
                    if (suggestions.length > 0) {
                      addByYutai(suggestions[0]);
                    } else {
                      addByFreeText(query);
                    }
                  }
                  if (e.key === "Escape") {
                    setShowDropdown(false);
                  }
                }}
                onFocus={() => {
                  if (query.trim()) setShowDropdown(true);
                }}
                placeholder="銘柄名・証券コードで検索(例: すかい、4755)"
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              />

              {/* オートコンプリートドロップダウン */}
              {showDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-md overflow-hidden"
                >
                  {suggestions.length > 0 ? (
                    <>
                      {suggestions.map((y) => {
                        const alreadyHeld = isAlreadyHeld(y.code);
                        return (
                          <button
                            key={y.code}
                            type="button"
                            disabled={alreadyHeld}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              addByYutai(y);
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors",
                              alreadyHeld
                                ? "opacity-40 cursor-not-allowed"
                                : "hover:bg-muted/60"
                            )}
                          >
                            <span className="font-mono text-xs text-muted-foreground w-10 shrink-0">
                              {y.code}
                            </span>
                            <span className="font-medium flex-1 truncate">{y.name}</span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {y.categories.slice(0, 2).join("・")}
                            </span>
                            {alreadyHeld && (
                              <span className="text-xs text-muted-foreground shrink-0">追加済</span>
                            )}
                          </button>
                        );
                      })}
                      {/* DBにない銘柄として「そのまま追加」 */}
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          addByFreeText(query);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 border-t border-border text-xs text-muted-foreground hover:bg-muted/40 transition-colors"
                      >
                        「{query}」をそのまま追加
                      </button>
                    </>
                  ) : (
                    <div className="px-3 py-3 space-y-1.5">
                      <p className="text-sm text-muted-foreground">候補が見つかりませんでした</p>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          addByFreeText(query);
                        }}
                        className="text-xs text-accent hover:underline"
                      >
                        「{query}」をそのまま追加する
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Enterキーでも追加できます</p>
          </div>

          {/* 保有リスト */}
          {held.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">追加した銘柄（{held.length}件）</p>
              <div className="space-y-1.5">
                {held.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
                  >
                    {item.resolved.found ? (
                      <>
                        <span className="font-mono text-xs text-muted-foreground w-10 shrink-0">
                          {item.resolved.yutai?.code}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{item.resolved.yutai?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.resolved.yutai?.categories.join("・")}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="w-10 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{item.input}</p>
                          <p className="text-xs text-muted-foreground">
                            データにない銘柄（優待なし株・未収録）
                          </p>
                        </div>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      aria-label={`${item.input}を削除`}
                      className="shrink-0 rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 0件のときのガイド */}
          {held.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              まだ銘柄が追加されていません。上の検索欄から追加してください。
            </p>
          )}

          {/* 分析ボタン */}
          <Button
            onClick={analyze}
            disabled={held.length === 0}
            className="w-full"
            size="lg"
          >
            分析する
          </Button>

          {/* デバッグ表示(Stage 3 完成前の暫定出力) */}
          {debugResult && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  分析結果（開発用デバッグ表示 — Stage 3 で本番UIに置き換えます）
                </p>
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all text-foreground/70">
                  {debugResult}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
