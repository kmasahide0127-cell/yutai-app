import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { GuideArticle, Note, P, Section, StockLink } from "@/components/guide/GuideArticle";
import { getGuide } from "@/lib/guides";
import { DATA_STATS, YUTAI_LIST, hasActiveYutai, isAnnualizedYutai, isVerifiedYutai } from "@/lib/yutai-data";
import { buildReceiptFlow } from "@/lib/stock-guide";
import { EXPENSE_CATEGORIES } from "@/lib/matching";

const guide = getGuide("getting-started");
export const metadata = buildPageMetadata({ title: guide.title, description: guide.description, path: "/guide/getting-started" });

// 記事中の実例(次の基準日・権利付最終日)は今日の日付に依存するため、銘柄ページと同じ間隔で再生成する
export const revalidate = 43200;

function yen(v: number): string {
  return `${v.toLocaleString("ja-JP")}円`;
}
function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}

export default function GettingStartedGuide() {
  const active = YUTAI_LIST.filter(hasActiveYutai);
  const min100 = active.filter((y) => y.minShares === 100).length;
  const minOver100 = active.filter((y) => y.minShares > 100);
  const invs = active.map((y) => y.approxInvestment);
  const under10 = active.filter((y) => y.approxInvestment < 100_000).length;
  const under30 = active.filter((y) => y.approxInvestment < 300_000).length;
  const holding = active.filter((y) => y.holdingRequirement);
  const lagRecorded = active.filter((y) => y.receiptLagMonths !== undefined);

  // 実例: 検証済み・継続保有条件なし・年1回の銘柄のうち、必要投資額が最も少ない銘柄(手順の説明用。勧める意図ではない)
  const example = active
    .filter((y) => isVerifiedYutai(y) && isAnnualizedYutai(y) && !y.holdingRequirement && y.rightsMonths.length === 1)
    .sort((a, b) => a.approxInvestment - b.approxInvestment)[0];
  const exampleFlow = example ? buildReceiptFlow(example) : [];

  return (
    <GuideArticle slug="getting-started">
      <Section id="overview" title="全体の流れ">
        <P>
          株主優待は、企業が決めた基準日(権利確定日)の時点で株主名簿に記録されている株主に対して、決められた株数以上を保有していることを条件に贈られます。
          受け取るまでの流れは、大きく次の5段階です。
        </P>
        <ol className="list-decimal space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>株式を売買できる証券口座を用意する</li>
          <li>生活の出費や使いたいサービスから、候補の銘柄を探す</li>
          <li>必要株数・必要投資額・権利確定月・継続保有条件を確認する</li>
          <li>権利付最終日までに必要株数を買い付ける</li>
          <li>基準日のあと、優待が届く(付与される)のを待つ</li>
        </ol>
      </Section>

      <Section id="account" title="1. 証券口座を用意する">
        <P>
          上場企業の株式を買うには証券口座が必要です。口座開設の手続き・必要書類・売買手数料は証券会社や取引コースによって異なるため、各社の案内で確認してください。
        </P>
        <P>
          当サイトに掲載している優待実施中の{DATA_STATS.active}銘柄は、いずれも「最低必要株数」以上の保有が優待の条件です。
          最低必要株数は{active.length}銘柄中{min100}銘柄が100株で、それより多い株数が必要な銘柄が{minOver100.length}銘柄あります
          (例: {minOver100.slice(0, 3).map((y, i) => (
            <span key={y.code}>{i > 0 && "、"}<StockLink code={y.code} name={y.name} />は{y.minShares.toLocaleString()}株</span>
          ))})。
          必要株数に満たない株数で保有している場合は、その銘柄の優待の対象になりません。
        </P>
      </Section>

      <Section id="find" title="2. 生活の出費から候補を探す">
        <P>
          当サイトでは、優待の一覧から選ぶのではなく、普段の出費や使っているサービスから候補を逆引きできます。
        </P>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li><Link href="/onboarding" className="text-primary underline">生活から診断</Link>: 出費カテゴリと予算を選ぶと、条件に合う優待の組み合わせを表示します。</li>
          <li><Link href="/expense" className="text-primary underline">出費カテゴリ</Link>: 外食・日用品・交通など{EXPENSE_CATEGORIES.length}カテゴリごとに、使える優待と権利確定月の分布を一覧できます。</li>
          <li><Link href="/search" className="text-primary underline">商品名で探す</Link>: ブランド名・商品名から、その商品を扱う企業の優待を逆引きします。</li>
          <li><Link href="/experiences" className="text-primary underline">体験から探す</Link>: 温泉・映画・テーマパークなど、したい体験から優待を探します。</li>
        </ul>
      </Section>

      <Section id="check" title="3. 条件を確認する">
        <P>候補が見つかったら、銘柄ページで次の4点を確認します。</P>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            <strong className="text-foreground">必要投資額</strong>: 株価 × 最低必要株数で計算した目安です。掲載銘柄の中央値は{yen(Math.round(median(invs)))}で、
            10万円未満で対象になる銘柄は{under10}銘柄、30万円未満では{under30}銘柄です(株価基準日時点)。株価は日々変わるため、購入時の株価で計算し直してください。
          </li>
          <li>
            <strong className="text-foreground">権利確定月</strong>: 優待の基準日がある月です。年1回の銘柄と年2回以上の銘柄があり、
            受け取る時期を分けたい場合は<Link href="/guide/calendar" className="text-primary underline">年間優待カレンダーの組み立て方</Link>を参照してください。
          </li>
          <li>
            <strong className="text-foreground">継続保有条件</strong>: 掲載銘柄のうち{holding.length}銘柄は「1年以上」などの継続保有が条件で、
            購入後すぐの基準日では受け取れません。判定の仕組みは<Link href="/guide/record-date" className="text-primary underline">権利付最終日・権利落ち日と継続保有条件の仕組み</Link>で説明しています。
          </li>
          <li>
            <strong className="text-foreground">情報の確認状況</strong>: 「✓ 検証済み」は企業IR・適時開示で確認した銘柄({DATA_STATS.activeVerified}銘柄)、
            「⚠ 参考情報」はそれ以外です。違いは<Link href="/guide/verification" className="text-primary underline">「検証済み」と「参考情報」の違い</Link>にまとめています。
          </li>
        </ul>
        <P>
          複数の株数区分がある銘柄(例: 100株と1,000株で内容が変わる)は、銘柄ページの「保有株数ごとの優待内容と必要投資額」に、優待内容の記載どおりの区分と、同じ株価で換算した必要投資額を表にしています。
        </P>
      </Section>

      <Section id="buy" title="4. 権利付最終日までに買い付ける">
        <P>
          基準日の株主名簿に載るには、基準日の2営業日前にあたる「権利付最終日」の取引終了までに買い付けておく必要があります。
          銘柄ページの「受け取るまでの流れと注意点」には、今日を起点にした次の基準日と権利付最終日(祝日を考慮しない概算)を表示しています。
        </P>
        {example && exampleFlow.length > 0 && (
          <Note>
            <p className="font-semibold text-foreground">
              実例: <StockLink code={example.code} name={example.name} />(最低{example.minShares.toLocaleString()}株・権利確定月{example.rightsMonths.join("・")}月・継続保有条件なし)
            </p>
            <ol className="mt-1 space-y-1">
              {exampleFlow.map((s) => (
                <li key={s.title}>
                  <span className="font-medium text-foreground">{s.title}</span>: {s.body}
                </li>
              ))}
            </ol>
            <p className="mt-1">
              ※ 手順を具体的に示すため、検証済みで継続保有条件のない年1回の銘柄のうち必要投資額が最も少ない銘柄を機械的に選んだ例です。購入を勧めるものではありません。
            </p>
          </Note>
        )}
      </Section>

      <Section id="receive" title="5. 優待が届く(付与される)まで">
        <P>
          優待の発送・付与の時期は企業ごとに異なります。当サイトで発送までの月数を個別に記録している銘柄は{lagRecorded.length}銘柄
          {lagRecorded.length > 0 && (
            <>
              (
              {lagRecorded.map((y, i) => (
                <span key={y.code}>{i > 0 && "、"}<StockLink code={y.code} name={y.name} />は基準日から{y.receiptLagMonths}ヶ月後</span>
              ))}
              )
            </>
          )}
          で、それ以外の銘柄は基準日から3ヶ月後を目安に「初回受取見込み」を概算しています(<Link href="/method#first-receipt" className="text-primary underline">算出方法</Link>)。
          実際の時期は企業の案内で確認してください。
        </P>
        <P>
          継続保有条件のない銘柄は、基準日を過ぎた後に売却しても、その基準日の優待は受け取れます。次の基準日の優待も受け取るには、その基準日まで保有している必要があります。
          継続保有条件のある銘柄は、途中で売却すると名簿の連続記録が途切れ、条件を満たすまでの期間が最初からになります。
        </P>
      </Section>

      <Section id="after" title="受け取った後に確認すること">
        <P>
          優待の内容は企業の判断で変更・廃止されることがあります。当サイトでは掲載データに反映した変更を<Link href="/changelog" className="text-primary underline">更新履歴</Link>に記録しており、
          実際にどのような変更が起きているかは<Link href="/guide/changes" className="text-primary underline">株主優待の変更・廃止はどう起きるか</Link>で整理しています。
        </P>
      </Section>
    </GuideArticle>
  );
}
