import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4 py-12">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="text-6xl">🔍</div>
        <h1 className="text-2xl font-bold">ページが見つかりません</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          トップページに戻る
        </Link>
      </div>
    </div>
  );
}
