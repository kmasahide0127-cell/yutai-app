"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { YUTAI_LIST, type Yutai } from "@/lib/yutai-data";
import { estimateFirstReceipt, type FirstReceiptEstimate } from "@/lib/product-search";
import { buildReceiptFlow, buildStockFaq, type FaqItem, type ReceiptStep } from "@/lib/stock-guide";
import { FirstReceiptNote } from "@/components/search/StockResultCard";

/**
 * 銘柄ページのうち「今日の日付」で内容が変わる部分(初回受取見込み・受け取るまでの流れ・FAQ)。
 *
 * ページはビルド時に静的生成し、アクセスごと・定期的なサーバー再生成はしない
 * (Vercel の Fast Origin Transfer を抑えるため)。HTML にはビルド日で計算した値を入れておき、
 * ブラウザ側で表示後に閲覧日の日付で計算し直す。
 * 初回描画(ハイドレーション)は必ずサーバーと同じ値にし、差し替えはマウント後に行う。
 * サーバー(UTC)とブラウザ(閲覧者のタイムゾーン)で日付がずれても不一致エラーにならないようにするため。
 */
function useClientToday(): Date | null {
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    setToday(new Date());
  }, []);
  return today;
}

export function FirstReceiptSection({
  yutai,
  initialEstimate,
  holdingNotice,
}: {
  yutai: Yutai;
  initialEstimate: FirstReceiptEstimate | null;
  holdingNotice: string | null;
}) {
  const today = useClientToday();
  const firstReceipt = today ? estimateFirstReceipt(yutai, today) : initialEstimate;

  if (firstReceipt) {
    return (
      <section
        className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2"
        aria-labelledby="first-receipt-heading"
      >
        <h2 id="first-receipt-heading" className="text-base font-bold">
          今から購入した場合の初回受取見込み
        </h2>
        <FirstReceiptNote estimate={firstReceipt} yutai={yutai} />
        <p className="text-xs text-muted-foreground">
          基準日の月末と権利付最終日(基準日の2営業日前)をもとにした概算で、祝日の並びは考慮していません。
          優待の発送・付与時期は企業ごとに異なります。参考情報としてご利用ください。
        </p>
      </section>
    );
  }

  if (holdingNotice) {
    return (
      <section className="rounded-xl border border-border bg-muted/30 p-4 space-y-1" aria-label="初回受取見込み">
        <h2 className="text-base font-bold">今から購入した場合の初回受取見込み</h2>
        <p className="text-xs text-muted-foreground">{holdingNotice}</p>
      </section>
    );
  }

  return null;
}

export function ReceiptFlowSection({
  yutai,
  initialSteps,
}: {
  yutai: Yutai;
  initialSteps: ReceiptStep[];
}) {
  const today = useClientToday();
  const receiptFlow = today ? buildReceiptFlow(yutai, today) : initialSteps;
  if (receiptFlow.length === 0) return null;

  return (
    <section className="space-y-3" aria-labelledby="flow-heading">
      <h2 id="flow-heading" className="text-base font-bold">受け取るまでの流れと注意点</h2>
      <ol className="space-y-2">
        {receiptFlow.map((step) => (
          <li key={step.title} className="rounded-lg border border-border bg-card p-3">
            <p className="text-sm font-semibold">{step.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
      <p className="text-xs text-muted-foreground leading-relaxed">
        日付は今日を起点に、権利付最終日 = 基準日の2営業日前(土日のみ除外・祝日は考慮しない)として計算した概算です。
        仕組みは<Link href="/guide/record-date" className="text-primary underline">権利付最終日・権利落ち日と継続保有条件の仕組み</Link>、
        計算方法は<Link href="/method#first-receipt" className="text-primary underline">算出方法</Link>で説明しています。
      </p>
    </section>
  );
}

/** 銘柄別 FAQ。基準日・受取見込みの回答が日付で変わるため、ブラウザで計算し直す */
export function StockFaqSection({
  yutai,
  initialFaq,
}: {
  yutai: Yutai;
  initialFaq: FaqItem[];
}) {
  const today = useClientToday();
  const faq = today ? buildStockFaq(yutai, YUTAI_LIST, today) : initialFaq;
  if (faq.length === 0) return null;

  return (
    <section className="space-y-2" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-base font-bold">{yutai.name}の優待についてのよくある質問</h2>
      <div className="space-y-2">
        {faq.map(({ q, a }) => (
          <div key={q} className="rounded-lg border border-border bg-card p-3">
            <h3 className="text-sm font-semibold">Q. {q}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">A. {a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
