import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "あなたの生活から優待を見つける",
  description: "4ステップで生活に合う株主優待の候補が見つかります。生活スタイル・出費・優先順位を選ぶだけ。",
  path: "/onboarding",
});

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
