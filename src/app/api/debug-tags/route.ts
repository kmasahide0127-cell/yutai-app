// 開発用: タグ分布確認エンドポイント。本番では呼ばれない想定。
import { debugTagDistribution } from "@/lib/matching";
import { YUTAI_LIST } from "@/lib/yutai-data";

export function GET() {
  const lines: string[] = [];
  const origLog = console.log;
  console.log = (...args: unknown[]) => {
    lines.push(args.map(String).join(" "));
    origLog(...args);
  };
  debugTagDistribution(YUTAI_LIST);
  console.log = origLog;
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
