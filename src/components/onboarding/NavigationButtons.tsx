"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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

  const handleBack = () => {
    router.push(`/onboarding?step=${currentStep - 1}`);
  };

  const handleNext = () => {
    router.push(`/onboarding?step=${currentStep + 1}`);
  };

  const handleResults = () => {
    if (!resultsHref) return;
    router.push(resultsHref);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm">
      <div
        className="mx-auto flex max-w-2xl items-center gap-3 px-4 pt-3 sm:pt-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      >
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
