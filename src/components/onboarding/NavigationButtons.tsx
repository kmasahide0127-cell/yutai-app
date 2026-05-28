"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboarding-store";

type NavigationButtonsProps = {
  currentStep: number;
  isNextDisabled: boolean;
  resultsHref?: string;
};

export function NavigationButtons({
  currentStep,
  isNextDisabled,
  resultsHref,
}: NavigationButtonsProps) {
  const router = useRouter();
  const reset = useOnboardingStore((s) => s.reset);

  const handleBack = () => {
    router.push(`/onboarding?step=${currentStep - 1}`);
  };

  const handleNext = () => {
    router.push(`/onboarding?step=${currentStep + 1}`);
  };

  const handleResults = () => {
    if (!resultsHref) return;
    reset();
    router.push(resultsHref);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/80 px-4 py-3 safe-bottom backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl gap-3">
        {currentStep > 1 && (
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={handleBack}
          >
            戻る
          </Button>
        )}

        {currentStep === 4 && resultsHref ? (
          <Button size="lg" className="flex-1" onClick={handleResults}>
            結果を見る
          </Button>
        ) : (
          <Button
            size="lg"
            className="flex-1"
            onClick={handleNext}
            disabled={isNextDisabled}
          >
            次へ
          </Button>
        )}
      </div>
    </div>
  );
}
