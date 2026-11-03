// src/ の TypeScript を Node で直接実行するための最小限の解決フック。
// Node 24 の型除去(--experimental-strip-types 相当・既定で有効)に加え、
//   - "@/..." を src/... に解決する(tsconfig の paths と同じ)
//   - 拡張子なしの相対 import に .ts / .tsx を補う
// だけを行う。ビルドツールを追加せずに、診断ロジックをそのまま呼ぶために使う。
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");

function withExtension(absPath) {
  for (const candidate of [absPath, `${absPath}.ts`, `${absPath}.tsx`, path.join(absPath, "index.ts")]) {
    if (existsSync(candidate) && !candidate.endsWith(path.sep)) {
      if (candidate === absPath && !/\.(ts|tsx|js|mjs|json)$/.test(candidate)) continue;
      return candidate;
    }
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    let target = null;
    if (specifier.startsWith("@/")) {
      target = withExtension(path.join(SRC, specifier.slice(2)));
    } else if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:")) {
      const base = path.dirname(fileURLToPath(context.parentURL));
      target = withExtension(path.resolve(base, specifier));
    }
    if (target) return nextResolve(pathToFileURL(target).href, context);
    return nextResolve(specifier, context);
  },
});
