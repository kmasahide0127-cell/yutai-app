import Link from "next/link";
import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { ResetLink } from "@/components/ResetLink";
import { DATA_LAST_UPDATED, VERIFIED_COUNT, TOTAL_COUNT, YUTAI_LIST } from "@/lib/yutai-data";
import { EXPENSE_CATEGORY_SLUGS } from "@/lib/matching";
import { siteConfig } from "@/config/site";
import AdUnit from "@/components/common/AdUnit";

export const metadata: Metadata = {
  title: "優待マッチ - 生活逆引き型 株主優待マッチング",
  description: "毎月の外食・通信費・交通費などの出費から、実生活で使える株主優待銘柄を提案。個人開発の情報提供サービスです。",
  alternates: {
    canonical: siteConfig.url,
  },
};

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${y}年${parseInt(m)}月${parseInt(d)}日`;
}

function formatYen(value: number): string {
  return value.toLocaleString("ja-JP") + "円相当";
}

const MONTH_LABELS = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

function buildCalendarData() {
  return MONTH_LABELS.map((label, i) => {
    const monthNum = i + 1;
    const matched = YUTAI_LIST.filter(
      (y) => y.annualValue > 0 && y.rightsMonths.includes(monthNum)
    );
    const examples = matched
      .sort((a, b) => {
        if (a.dataQuality === "verified" && b.dataQuality !== "verified") return -1;
        if (a.dataQuality !== "verified" && b.dataQuality === "verified") return 1;
        return b.annualValue - a.annualValue;
      })
      .slice(0, 2);
    return { label, count: matched.length, examples };
  });
}

const FEATURES = [
  {
    title: "生活から逆引き検索",
    body: "優待ありきではなく、毎月の出費カテゴリから逆引きでマッチングします。実際に使える優待が見つかりやすいのが特徴です。",
  },
  {
    title: "14カテゴリ対応",
    body: "外食・通信・旅行・美容・趣味・子育てなど、日常生活の出費カテゴリ全14種に対応しています。",
  },
  {
    title: `${TOTAL_COUNT}銘柄掲載・${VERIFIED_COUNT}銘柄検証済み`,
    body: `主要な優待銘柄を幅広くカバー。うち${VERIFIED_COUNT}銘柄は運営者が内容を高い確度で把握した「検証済み」です。`,
  },
  {
    title: "登録不要・ブラウザ完結",
    body: "メール登録・ログイン不要。入力データはすべてブラウザ内に保存され、サーバーに個人情報は送信されません。",
  },
  {
    title: "5年・10年プランで無理なく完成",
    body: "資産に余裕がある方は急いで揃える必要はありません。株式に使ってもよい総額を入力すると、5年・10年かけて優待カレンダーを完成させる年ごとの投資計画を提案します。",
  },
];

const FAQ_ITEMS = [
  {
    q: "登録・ログインは必要ですか？",
    a: "不要です。ブラウザのみで動作し、メールアドレスなどの個人情報の登録は一切不要です。",
  },
  {
    q: "株主優待とはなんですか？",
    a: "企業が株主に対して自社製品・サービスを提供する制度です。一定数の株を保有することが条件で、権利確定月に保有していると翌2〜3ヶ月後に優待を受け取れます。",
  },
  {
    q: "情報は最新ですか？",
    a: `掲載データの取得基準日は${formatDate(DATA_LAST_UPDATED)}です。優待内容は企業の判断により変更・廃止されることがあります。最新情報は必ず各企業のIRページでご確認ください。`,
  },
  {
    q: "このサービスは投資推奨ですか？",
    a: "いいえ。本サービスは情報提供のみを目的としており、投資助言・投資勧誘ではありません。個別銘柄の売買推奨・目標株価の提示は行いません。投資判断はご自身の責任で行ってください。",
  },
  {
    q: "どんな情報を入力すればいいですか？",
    a: "毎月の出費カテゴリ(外食、通信費など)と、今年度優待に充てられる目安の予算を選ぶだけです。氏名・住所・メールアドレス等の個人情報は一切不要です。",
  },
];

export default function Home() {
  const calendarData = buildCalendarData();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">

      {/* ── 1. ヒーローセクション ──────────────────────────── */}
      <section className="w-full flex flex-col items-center text-center px-4 pt-16 pb-10">
        <header className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight">優待マッチ</h1>
          <p className="text-base text-muted-foreground mt-2">生活逆引き型 株主優待マッチング</p>
        </header>
        <p className="text-xl text-muted-foreground max-w-sm">
          あなたの生活に合う株主優待を見つけます
        </p>
        <p className="text-sm text-muted-foreground max-w-sm mt-2">
          今年度の予算で組めるところから始めて、来年以降も少しずつ買い足しながら年間優待カレンダーを完成させていけます
        </p>
        <div className="flex flex-col items-center gap-3 mt-8">
          <Link href="/onboarding" className={buttonVariants({ size: "lg" })}>
            始める(無料・1分)
          </Link>
          <ResetLink />
          <p className="text-xs text-muted-foreground text-center mt-2">
            データ最終更新: {formatDate(DATA_LAST_UPDATED)}<br />
            全{TOTAL_COUNT}銘柄（検証済み {VERIFIED_COUNT}銘柄）
          </p>
        </div>
      </section>

      {/* ── 各コンテンツセクション ──────────────────────────── */}
      <div className="w-full max-w-2xl mx-auto px-4 pb-16 space-y-14">

        {/* ── 2. サービス紹介 ── */}
        <section aria-labelledby="service-intro-heading">
          <div className="border border-border rounded-xl p-6 bg-card space-y-4">
            <h2 id="service-intro-heading" className="text-lg font-bold text-foreground">
              優待マッチとは
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              優待マッチは、毎月の生活費からそれを削減できる株主優待を
              <strong className="text-foreground">逆引きで探せる</strong>情報提供サービスです。
              外食、日用品、通信、旅行、美容、趣味など
              <strong className="text-foreground">14カテゴリ</strong>から検索でき、
              全<strong className="text-foreground">{TOTAL_COUNT}銘柄</strong>を掲載
              （うち<strong className="text-foreground">{VERIFIED_COUNT}銘柄</strong>は運営者が内容を精査した「検証済み」）。
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              本サービスは個人開発で運営しています。掲載情報は参考情報であり、
              <strong className="text-foreground">投資助言・投資勧誘ではありません。</strong>
              投資判断はご自身の責任でお願いします。
            </p>
            <div className="grid grid-cols-3 gap-3 pt-2">
              {(
                [
                  { value: `${TOTAL_COUNT}`, label: "掲載銘柄数" },
                  { value: `${VERIFIED_COUNT}`, label: "検証済み" },
                  { value: "14", label: "カテゴリ数" },
                ] as const
              ).map(({ value, label }) => (
                <div key={label} className="text-center py-3 rounded-lg bg-muted/30">
                  <div className="text-xl font-bold text-foreground">{value}<span className="text-xs font-normal">銘柄</span></div>
                  <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. 使い方3ステップ ── */}
        <section aria-labelledby="steps-heading">
          <h2 id="steps-heading" className="text-base font-bold text-foreground mb-4">
            使い方 ― 3ステップで完了
          </h2>
          <ol className="space-y-3">
            {[
              {
                step: "1",
                title: "出費カテゴリを選ぶ",
                body: "外食・通信費・旅行費など、毎月かかる出費カテゴリにチェックを入れます。",
              },
              {
                step: "2",
                title: "条件を入力する",
                body: "今年度、優待に使える予算の目安と世帯構成を選びます。個人情報の入力は不要です。",
              },
              {
                step: "3",
                title: "年間優待カレンダーを組み立てる",
                body: "予算内で権利確定月が分散する組み合わせを自動提案。今年埋まらない月は来年以降の買い足し候補として表示し、1年かけてカレンダーを完成させていけます。",
              },
            ].map(({ step, title, body }) => (
              <li key={step} className="flex gap-4 items-start p-4 rounded-xl border border-border bg-card">
                <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  {step}
                </span>
                <div>
                  <p className="font-semibold text-sm text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-4 text-center">
            <Link href="/onboarding" className={buttonVariants({ variant: "outline", size: "sm" })}>
              今すぐ試してみる →
            </Link>
          </div>
        </section>

        <AdUnit format="horizontal" className="py-2" />

        {/* ── 4. 年間優待カレンダー例 ── */}
        <section aria-labelledby="calendar-heading">
          <h2 id="calendar-heading" className="text-base font-bold text-foreground mb-1">
            年間優待カレンダー例
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            株主優待は権利確定月に保有していると受け取れます。月ごとの掲載銘柄数と代表例を示します（参考情報）。
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {calendarData.map(({ label, count, examples }) => (
              <div key={label} className="border border-border rounded-xl p-3 bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">{label}</span>
                  <span className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md">
                    {count}銘柄
                  </span>
                </div>
                {examples.length > 0 ? (
                  <ul className="space-y-1.5">
                    {examples.map((ex) => (
                      <li key={ex.code}>
                        <Link
                          href={`/stocks/${ex.code}`}
                          className="block text-xs hover:opacity-80 transition-opacity"
                        >
                          <span className="font-medium text-foreground leading-tight">{ex.name}</span>
                          <br />
                          <span className="text-muted-foreground">年{formatYen(ex.annualValue)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">該当銘柄なし</p>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            ※ 表示は参考例です。権利確定月・優待内容は変更される場合があります。最新情報は各企業のIRページをご確認ください。
          </p>
        </section>

        {/* ── 5. カテゴリから探す ── */}
        <section aria-labelledby="category-heading">
          <h2 id="category-heading" className="text-base font-bold text-foreground mb-3">
            出費カテゴリから探す
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(EXPENSE_CATEGORY_SLUGS).map(([cat, slug]) => (
              <Link
                key={slug}
                href={`/expense/${slug}`}
                className="inline-flex items-center px-2.5 py-1 rounded-md border border-border bg-card text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
          <div className="mt-3 text-right">
            <Link href="/stocks" className="text-primary underline text-xs hover:opacity-80">
              全{TOTAL_COUNT}銘柄の一覧を見る →
            </Link>
          </div>
        </section>

        {/* ── 6. サイトの特徴 ── */}
        <section aria-labelledby="features-heading">
          <h2 id="features-heading" className="text-base font-bold text-foreground mb-4">
            サイトの特徴
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURES.map(({ title, body }) => (
              <div key={title} className="border border-border rounded-xl p-4 bg-card">
                <p className="font-semibold text-sm text-foreground mb-1.5">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7. よくある質問 ── */}
        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-base font-bold text-foreground mb-4">
            よくある質問
          </h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map(({ q, a }) => (
              <details
                key={q}
                className="border border-border rounded-xl bg-card overflow-hidden"
              >
                <summary className="px-4 py-3 text-sm font-medium text-foreground cursor-pointer select-none flex items-start gap-2 list-none [&::-webkit-details-marker]:hidden">
                  <span className="shrink-0 text-primary font-bold mt-px">Q.</span>
                  <span>{q}</span>
                </summary>
                <div className="px-4 pb-4 pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground leading-relaxed">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        <AdUnit format="horizontal" className="py-2" />

        {/* ── 8. 注意事項・免責 ── */}
        <section aria-labelledby="disclaimer-heading">
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-5 space-y-3">
            <h2 id="disclaimer-heading" className="font-bold text-sm text-foreground">
              重要な注意事項
            </h2>
            <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed list-disc list-inside">
              <li>
                本サービスは<strong className="text-foreground">情報提供のみ</strong>を目的としており、
                投資助言・投資勧誘にはあたりません。
              </li>
              <li>
                個別銘柄の売買推奨・目標株価の提示・将来の投資成果の保証は行いません。
              </li>
              <li>
                <strong className="text-foreground">投資判断はご自身の責任</strong>で行ってください。
                本サービスの情報を利用した投資に伴う損益について、運営者は一切の責任を負いません。
              </li>
              <li>
                優待情報は変更・廃止される場合があります。最新情報は各企業のIR情報をご確認ください。
              </li>
              <li>
                本サービスはすべてのユーザーデータをブラウザ内に保存します。
                サーバーへの個人情報送信は行いません。
              </li>
            </ul>
          </div>
        </section>

      </div>

      {/* ── 9. フッター ──────────────────────────────────── */}
      <footer className="mt-4 mb-6 text-center text-xs text-muted-foreground space-y-3 max-w-2xl mx-auto px-4">
        <p className="leading-relaxed">
          本サイトは個人開発による情報提供サイトです。優待情報は{formatDate(DATA_LAST_UPDATED)}時点のもので、
          最新でない可能性があります。投資判断はご自身の責任でお願いします。
          詳細は<Link href="/terms" className="underline">利用規約</Link>をご確認ください。
        </p>
        <nav aria-label="フッターナビゲーション">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link href="/stocks" className="hover:underline">銘柄一覧</Link>
            <Link href="/about" className="hover:underline">このサイトについて</Link>
            <Link href="/contact" className="hover:underline">お問い合わせ</Link>
            <Link href="/terms" className="hover:underline">利用規約</Link>
            <Link href="/privacy" className="hover:underline">プライバシーポリシー</Link>
          </div>
        </nav>
        <p>© 2026 優待マッチ | データ取得日: {formatDate(DATA_LAST_UPDATED)}</p>
      </footer>

    </div>
  );
}
