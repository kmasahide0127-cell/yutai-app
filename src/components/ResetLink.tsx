"use client";

import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/onboarding-store";

export function ResetLink() {
  const router = useRouter();
  const reset = useOnboardingStore((s) => s.reset);

  const handleClick = () => {
    reset();
    router.push("/onboarding");
  };

  return (
    <button
      onClick={handleClick}
      className="text-sm text-muted-foreground hover:underline"
    >
      最初からやり直す
    </button>
  );
}
