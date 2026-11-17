import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { GuideArticle, Note, P, Section, StockLink } from "@/components/guide/GuideArticle";
import { getGuide } from "@/lib/guides";
import { CHANGELOG, type ChangelogEntry, type ChangelogKind } from "@/lib/changelog-data";
import { DATA_STATS } from "@/lib/yutai-data";

const guide = getGuide("changes");
export const metadata = buildPageMetadata({ title: guide.title, description: guide.description, path: "/guide/changes" });

const KIND_ORDER: ChangelogKind[] = ["新設", "変更", "廃止", "上場廃止", "掲載停止", "追加", "修正"];

function EntryList({ entries }: { entries: ChangelogEntry[] }) {
  return (
    <div className="space-y-2">
      {entries.map((e) => (
        <Note key={`${e.kind}-${e.code}-${e.date}`}>
          <p className="font-semibold text-foreground">
            {e.code && e.hasPage ? <StockLink code={e.code} name={e.name} /> : e.name}
            <span className="ml-2 font-normal text-muted-foreground">当サイトへの反映: {e.date}</span>
          </p>
          <p className="mt-1">{e.detail}</p>
        </Note>
      ))}
    </div>
  );
}

export default function ChangesGuide() {
  const counts = KIND_ORDER.map((k) => ({ k, n: CHANGELOG.filter((e) => e.kind === k).length })).filter((c) => c.n > 0);
  const byKind = (k: ChangelogKind) =>
    CHANGELOG.filter((e) => e.kind === k).sort((a, b) => b.date.localeCompare(a.date));
  const added = byKind("新設");
  const changed = byKind("変更");
  const abolished = byKind("廃止");
  const delisted = byKind("上場廃止");
  // 株式分割に伴う必要株数の変更(更新履歴の本文に「分割」を含む変更・修正)
  const splits = CHANGELOG.filter((e) => (e.kind === "変更" || e.kind === "修正") && e.code && e.detail.includes("分割"));
  const mbo = delisted.filter((e) => /MBO|TOB|公開買付/.test(e.detail)).length;

  return (
    <GuideArticle slug="changes">
      <Section id="summary" title="更新履歴に記録している変更の種類">
        <P>
          当サイトでは、掲載データに反映した変更を<Link href="/changelog" className="text-primary underline">更新履歴</Link>に記録しています。
          現在の記録件数は次のとおりです(「修正」は当サイトの掲載内容の誤りや確認元の更新、「追加」は掲載銘柄の追加で、企業側の制度変更ではありません)。
        </P>
        <ul className="grid grid-cols-2 gap-1 text-sm sm:grid-cols-4">
          {counts.map(({ k, n }) => (
            <li key={k} className="rounded-md border border-border bg-card px-3 py-1.5">
              {k}: <span className="tabular-nums font-semibold">{n}</span>件
            </li>
          ))}
        </ul>
        <P>
          企業側の制度の変化にあたるのは「新設」「変更」「廃止」「上場廃止」です。以下では、それぞれ実際に記録した例を見ていきます。
          現在、廃止・上場廃止として記録を残している銘柄は{DATA_STATS.abolished}銘柄で、銘柄ページでは「いつの権利分で終わったか」を表示しています。
        </P>
      </Section>

      {added.length > 0 && (
        <Section id="new" title="新設: 優待制度の導入">
          <P>
            新しく優待制度を導入する企業もあります。導入は適時開示で発表され、初回の基準日が発表の数ヶ月後に設定されることがあります。
            継続保有条件付きで導入されると、発表後に買い付けても初回の基準日では対象にならない場合があります。
          </P>
          <EntryList entries={added} />
        </Section>
      )}

      {changed.length > 0 && (
        <Section id="change" title="変更: 内容・必要株数・基準月の見直し">
          <P>
            内容の拡充・縮小のほか、株式分割に合わせて必要株数が変わる例があります。分割後は同じ金額の保有でも株数が増えるため、
            「100株以上」だった条件が分割比率に応じて「300株以上」などに変わることがあります。
            {splits.length > 0 && `更新履歴では${splits.length}件の記録で株式分割に触れています。`}
          </P>
          <EntryList entries={changed} />
        </Section>
      )}

      {abolished.length > 0 && (
        <Section id="abolish" title="廃止: 優待制度の終了">
          <P>
            優待制度を終了する例です。記録の中には、配当に集約するとしたものや、廃止を決議した時点ですでに最後の権利分が過ぎていたものがあります。
            銘柄ページは削除せず、最後の権利分を確認できている銘柄ではそれを表示しています。
          </P>
          <EntryList entries={abolished} />
        </Section>
      )}

      {delisted.length > 0 && (
        <Section id="delist" title="上場廃止: 会社ごと株式市場から外れる">
          <P>
            公開買付け(TOB)や経営陣による買収(MBO)などで上場廃止になると、市場で株式を買えなくなり、優待も受けられなくなります。
            記録している{delisted.length}件のうち{mbo}件は、本文にMBO・TOB・公開買付けの記載があるものです。
          </P>
          <EntryList entries={delisted} />
        </Section>
      )}

      <Section id="notice" title="変更に気づくために">
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>保有している銘柄・検討している銘柄は、企業のIRページと適時開示を定期的に確認します。</li>
          <li>当サイトでは週1回、優待に関する適時開示を自動で検出し、掲載内容との照合に使っています。反映した変更は更新履歴に日付つきで記録します。</li>
          <li>銘柄ページの確認日より後に変更が発表されている可能性があるため、購入前には企業の一次情報を確認してください(手順は<Link href="/guide/verification" className="text-primary underline">情報の確かめ方</Link>)。</li>
        </ul>
        <P>
          優待の変更・廃止は事前に予測できるものではなく、当サイトも将来の変更の可能性については評価していません。
          内容が変わった場合に家計への影響がどの程度かは、銘柄ページの年間優待価値と、ご自身の利用状況で確認してください。
        </P>
      </Section>
    </GuideArticle>
  );
}
