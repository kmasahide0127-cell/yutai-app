"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4 py-12">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="text-6xl">😔</div>
        <h1 className="text-2xl font-bold">エラーが発生しました</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          申し訳ありません、予期しないエラーが発生しました。
          下のボタンから再試行するか、トップページに戻ってください。
        </p>

        <div className="flex flex-col gap-2">
          <Button onClick={reset} size="lg">
            再試行
          </Button>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:underline underline-offset-2"
          >
            トップページに戻る
          </Link>
        </div>

        {error.digest && (
          <p className="text-xs text-muted-foreground pt-4">
            エラーID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
