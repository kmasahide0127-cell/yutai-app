// 開発用: タグ分布確認エンドポイント。
// 内部のタグ設計やデータ構成を外部に晒さないよう、本番ビルドでは 404 を返す。
import { debugTagDistribution } from "@/lib/matching";
import { debugExperienceTagCoverage } from "@/lib/experience-matching";
import { YUTAI_LIST } from "@/lib/yutai-data";

export function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not Found", { status: 404 });
  }
  const lines: string[] = [];
  const origLog = console.log;
  console.log = (...args: unknown[]) => {
    lines.push(args.map(String).join(" "));
    origLog(...args);
  };
  debugTagDistribution(YUTAI_LIST);
  console.log("");
  debugExperienceTagCoverage(YUTAI_LIST);
  console.log = origLog;
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
