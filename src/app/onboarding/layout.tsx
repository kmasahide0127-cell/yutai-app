import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "あなたの生活から優待を見つける",
  description: "4ステップであなたにぴったりの株主優待が見つかります。生活スタイル・出費・優先順位を選ぶだけ。",
  alternates: {
    canonical: "/onboarding",
  },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
