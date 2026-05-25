import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">優待アプリ</h1>
        <p className="text-sm text-muted-foreground mt-1">（仮称）</p>
      </header>

      <main className="text-center space-y-8">
        <p className="text-xl text-muted-foreground max-w-sm">
          あなたの生活に合う株主優待を見つけます
        </p>
        <Link href="/lifestyle" className={buttonVariants({ size: "lg" })}>
          始める
        </Link>
      </main>
    </div>
  );
}
