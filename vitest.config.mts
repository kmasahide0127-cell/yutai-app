import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// テスト対象は src/lib の純粋ロジックのみ(DOM 不要)なので environment は node のまま。
// tsconfig の "@/*" エイリアスは Vitest が解決しないため、ここで同じ対応を定義する
// (vite-tsconfig-paths を入れずに済ませ、依存を増やさないため)。
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
