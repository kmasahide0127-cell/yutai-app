import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { GuideArticle, Note, P, Section, StockLink } from "@/components/guide/GuideArticle";
import { getGuide } from "@/lib/guides";
import { YUTAI_LIST, hasActiveYutai } from "@/lib/yutai-data";
import { rightsLastTradingDay } from "@/lib/product-search";
import { buildReceiptFlow, explicitRecordDays } from "@/lib/stock-guide";

const guide = getGuide("record-date");
export const metadata = buildPageMetadata({ title: guide.title, description: guide.description, path: "/guide/record-date" });

// 「今後の権利付最終日」の表は今日の日付に依存するため定期的に再生成する
export const revalidate = 43200;

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
function md(d: Date): string {
  return `${d.getMonth() + 1}月${d.getDate()}日(${WEEKDAYS[d.getDay()]})`;
}
function nextBusinessDay(d: Date): Date {
  const n = new Date(d);
  do n.setDate(n.getDate() + 1);
  while (n.getDay() === 0 || n.getDay() === 6);
  return n;
}
function lastBusinessDay(year: number, month: number): Date {
  const d = new Date(year, month, 0);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1);
  return d;
}
function monthList(months: number[]): string {
  return months.map((m) => `${m}月`).join("・");
}

export default function RecordDateGuide() {
  const active = YUTAI_LIST.filter(hasActiveYutai);
  const today = new Date();

  // 今月(権利付最終日が過ぎていれば来月)から6ヶ月分の月末基準日
  const rows: Array<{ y: number; m: number; record: Date; cum: Date; ex: Date; count: number }> = [];
  for (let i = 0; rows.length < 6 && i < 8; i++) {
    const base = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const y = base.getFullYear();
    const m = base.getMonth() + 1;
    const cum = rightsLastTradingDay(y, m);
    if (cum < new Date(today.getFullYear(), today.getMonth(), today.getDate())) continue;
    rows.push({ y, m, record: lastBusinessDay(y, m), cum, ex: nextBusinessDay(cum), count: active.filter((s) => s.rightsMonths.includes(m)).length });
  }

  const holding = active.filter((y) => y.holdingRequirement);
  const withRules = holding.filter((y) => y.requiredConsecutiveRecords);
  const withoutRules = holding.filter((y) => !y.requiredConsecutiveRecords);
  const recordDiffers = withRules.filter(
    (y) => y.recordMonths && y.recordMonths.slice().sort().join() !== y.rightsMonths.slice().sort().join(),
  );
  const recordCounts = new Map<number, number>();
  for (const y of withRules) recordCounts.set(y.requiredConsecutiveRecords!, (recordCounts.get(y.requiredConsecutiveRecords!) ?? 0) + 1);
  const sameHolderNo = active.filter((y) => y.description.includes("同一株主番号")).length;
  const midMonth = active.filter((y) => explicitRecordDays(y).size > 0);

  // 継続保有の実例: 判定ルールが入力済みで、名簿記録月と優待の基準日がずれる銘柄のうち記録回数が最も多いもの
  const example = [...recordDiffers].sort(
    (a, b) => (b.requiredConsecutiveRecords ?? 0) - (a.requiredConsecutiveRecords ?? 0) || a.code.localeCompare(b.code),
  )[0];
  const exampleFlow = example ? buildReceiptFlow(example, today) : [];

  return (
    <GuideArticle slug="record-date">
      <Section id="terms" title="基準日・権利付最終日・権利落ち日">
        <P>
          <strong className="text-foreground">基準日(権利確定日)</strong>は、優待を受け取る株主を決めるために企業が株主名簿を締める日です。
          当サイトの掲載データでは、多くの銘柄で「権利確定月の月末」を基準日として扱っています。
        </P>
        <P>
          株式は買い付けた日から2営業日後に受け渡され、その時点で株主名簿に記録されます。そのため基準日の名簿に載るには、
          基準日の<strong className="text-foreground">2営業日前</strong>までに買い付けておく必要があります。この日を
          <strong className="text-foreground">権利付最終日</strong>、その翌営業日を<strong className="text-foreground">権利落ち日</strong>と呼びます。
          権利落ち日以降に買った株式では、その基準日の優待は受け取れません。反対に、権利付最終日までに買って保有していれば、権利落ち日以降に売却してもその回の権利は確定しています。
        </P>
      </Section>

      <Section id="schedule" title="今後6ヶ月の月末基準日と権利付最終日(概算)">
        <P>
          当サイトの<Link href="/method#first-receipt" className="text-primary underline">初回受取見込み</Link>と同じ規則(土日のみを除いて数え、祝日・年末年始の休場日は考慮しない)で計算した、今後の月末基準日の日程です。
          祝日が重なる月は、実際の権利付最終日が表より前になることがあります。
        </P>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[460px] text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">基準日(月末営業日)</th>
                <th scope="col" className="px-3 py-2 font-medium">権利付最終日</th>
                <th scope="col" className="px-3 py-2 font-medium">権利落ち日</th>
                <th scope="col" className="px-3 py-2 font-medium">この月に権利確定する掲載銘柄</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.y}-${r.m}`} className="border-t border-border">
                  <td className="px-3 py-2">{r.y}年{md(r.record)}</td>
                  <td className="px-3 py-2">{md(r.cum)}</td>
                  <td className="px-3 py-2">{md(r.ex)}</td>
                  <td className="px-3 py-2 tabular-nums">{r.count}銘柄</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {midMonth.length > 0 && (
          <P>
            なお、優待内容の記載で月末以外の基準日が書かれている銘柄が{midMonth.length}銘柄あります(
            {midMonth.map((y, i) => (
              <span key={y.code}>
                {i > 0 && "、"}
                <StockLink code={y.code} name={y.name} />: {[...explicitRecordDays(y)].map(([m, d]) => `${m}月${d}日`).join("・")}
              </span>
            ))}
            )。これらの銘柄ページでは、記載された日から権利付最終日を計算しています。
          </P>
        )}
      </Section>

      <Section id="holding" title="継続保有条件は「名簿に何回記録されたか」で判定される">
        <P>
          「1年以上継続保有」のような条件は、保有日数を数えるのではなく、決められた月の株主名簿に<strong className="text-foreground">同じ株主として連続して何回記録されたか</strong>で判定されます(当サイトで判定方法を確認できた銘柄の場合)。
          掲載銘柄のうち継続保有が条件の銘柄は{holding.length}銘柄で、そのうち{withRules.length}銘柄は判定に使う名簿の月と連続記録回数を確認してデータに入力しており、
          当サイトの初回受取見込みはこの記録回数で計算しています。
          優待内容の記載に「同一株主番号」での記録が条件と書かれている銘柄は{sameHolderNo}銘柄あります。
        </P>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
          {[...recordCounts.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([n, c]) => (
              <li key={n}>連続{n}回の記録が必要な銘柄: {c}銘柄</li>
            ))}
        </ul>
        <P>
          判定に使う名簿の月が、優待の基準日と異なる銘柄もあります。掲載データでは{recordDiffers.length}銘柄が該当し、たとえば
          {recordDiffers.slice(0, 3).map((y, i) => (
            <span key={y.code}>
              {i > 0 && "、"}
              <StockLink code={y.code} name={y.name} />は優待の基準日が{monthList(y.rightsMonths)}末、継続保有の判定は{monthList(y.recordMonths ?? [])}末の名簿
            </span>
          ))}
          です。この場合、優待の基準日だけを見ていると、条件を満たすまでの期間を短く見積もってしまいます。
        </P>
        {withoutRules.length > 0 && (
          <P>
            残りの{withoutRules.length}銘柄は、継続保有の条件はあるものの判定方法(名簿の記録回数)を確認できていないため、銘柄ページで初回受取見込みを算出せず、その旨を表示しています。
          </P>
        )}
        {example && exampleFlow.length > 0 && (
          <Note>
            <p className="font-semibold text-foreground">
              実例: <StockLink code={example.code} name={example.name} />({example.holdingRequirement}の継続保有、
              {monthList(example.recordMonths ?? example.rightsMonths)}末の名簿に連続{example.requiredConsecutiveRecords}回、優待の基準日は{monthList(example.rightsMonths)}末)を今日買った場合
            </p>
            <ol className="mt-1 space-y-1">
              {exampleFlow.map((s) => (
                <li key={s.title}>
                  <span className="font-medium text-foreground">{s.title}</span>: {s.body}
                </li>
              ))}
            </ol>
            <p className="mt-1">※ 仕組みの説明のための実例で、購入を勧めるものではありません。</p>
          </Note>
        )}
      </Section>

      <Section id="cautions" title="注意しておきたい点">
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>継続保有条件のある銘柄は、途中で全株を売却して名簿から外れると連続記録が途切れ、条件を満たすまでの期間が最初からになります。</li>
          <li>株式分割があると必要株数が変わることがあります(実例は<Link href="/guide/changes" className="text-primary underline">変更・廃止の実例</Link>)。</li>
          <li>権利付最終日の日付は当サイトの概算です。正確な日付は証券会社の表示や取引所のカレンダーで確認してください。</li>
        </ul>
      </Section>
    </GuideArticle>
  );
}
