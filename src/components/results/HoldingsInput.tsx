"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { YUTAI_LIST } from "@/lib/yutai-data";
import type { Yutai } from "@/lib/yutai-data";
import { cn } from "@/lib/utils";

function searchYutai(query: string): Yutai[] {
  const lower = query.toLowerCase();
  return YUTAI_LIST.filter(
    (y) =>
      y.name.toLowerCase().includes(lower) ||
      y.code.includes(lower)
  ).slice(0, 8);
}

type Props = {
  heldYutai: Yutai[];
  onChange: (held: Yutai[]) => void;
};

export function HoldingsInput({ heldYutai, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Yutai[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
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
    (code: string) => heldYutai.some((y) => y.code === code),
    [heldYutai]
  );

  function addYutai(yutai: Yutai) {
    if (isAlreadyHeld(yutai.code)) return;
    onChange([...heldYutai, yutai]);
    setQuery("");
    setShowDropdown(false);
    inputRef.current?.focus();
  }

  function removeYutai(code: string) {
    onChange(heldYutai.filter((y) => y.code !== code));
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">保有済み銘柄(任意)</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          すでに持っている優待株を入れると、その分を除いて提案します。
        </p>
      </div>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && suggestions.length > 0) {
              addYutai(suggestions[0]);
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

        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-md overflow-hidden"
          >
            {suggestions.length > 0 ? (
              suggestions.map((y) => {
                const alreadyHeld = isAlreadyHeld(y.code);
                return (
                  <button
                    key={y.code}
                    type="button"
                    disabled={alreadyHeld}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addYutai(y);
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
              })
            ) : (
              <div className="px-3 py-3">
                <p className="text-sm text-muted-foreground">候補が見つかりませんでした</p>
              </div>
            )}
          </div>
        )}
      </div>

      {heldYutai.length > 0 && (
        <div className="space-y-1.5">
          {heldYutai.map((y) => (
            <div
              key={y.code}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
            >
              <span className="font-mono text-xs text-muted-foreground w-10 shrink-0">
                {y.code}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{y.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {y.categories.join("・")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeYutai(y.code)}
                aria-label={`${y.name}を削除`}
                className="shrink-0 rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
