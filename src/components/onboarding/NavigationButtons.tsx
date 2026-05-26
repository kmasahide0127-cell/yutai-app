"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  return (
    <div className="sticky bottom-0 z-20 border-t border-border bg-background/80 px-4 py-3 backdrop-blur-sm">
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

        {currentStep === 5 && resultsHref ? (
          <Link
            href={resultsHref}
            className={cn(buttonVariants({ size: "lg" }), "flex-1")}
          >
            結果を見る
          </Link>
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
