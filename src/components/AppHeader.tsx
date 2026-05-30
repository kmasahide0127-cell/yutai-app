"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/onboarding-store";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export function AppHeader() {
  const router = useRouter();
  const reset = useOnboardingStore((s) => s.reset);

  const handleReset = () => {
    reset();
    router.push("/onboarding");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm safe-top">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 safe-left safe-right">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🎁</span>
          <span className="font-bold">優待アプリ</span>
        </Link>
        <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-xs">やり直す</span>
        </Button>
      </div>
    </header>
  );
}
