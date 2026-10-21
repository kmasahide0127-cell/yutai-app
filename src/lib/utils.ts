import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// JSON-LD を <script> に埋め込む際、データ中の "</script>" でタグが閉じられて
// 任意スクリプトが混入しないよう "<" をエスケープする(JSONとしては同値)
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
