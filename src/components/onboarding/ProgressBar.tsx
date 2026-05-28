"use client";

import { Receipt, Users, Wallet, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type StepMeta = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  step: number;
};

const STEPS: StepMeta[] = [
  { icon: Receipt, label: "出費", step: 1 },
  { icon: Users, label: "世帯", step: 2 },
  { icon: Wallet, label: "投資額", step: 3 },
  { icon: CircleCheck, label: "確認", step: 4 },
];

type ProgressBarProps = {
  currentStep: number;
};

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const progressPercent = (currentStep / 4) * 100;
  const currentMeta = STEPS[currentStep - 1];

  return (
    <div className="sticky top-0 z-20 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto max-w-2xl space-y-3">
        <p className="text-sm font-medium">
          Step {currentStep}/4 — {currentMeta.label}
        </p>

        {/* プログレスバー */}
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* ステップアイコン */}
        <div className="flex items-center justify-between">
          {STEPS.map(({ icon: Icon, label, step }) => {
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;
            return (
              <div key={step} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full transition-all duration-300",
                    isCompleted &&
                      "bg-primary text-primary-foreground",
                    isCurrent &&
                      "bg-accent text-accent-foreground ring-2 ring-accent/30",
                    !isCompleted &&
                      !isCurrent &&
                      "border border-border text-muted-foreground"
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <span
                  className={cn(
                    "hidden text-[10px] transition-colors duration-300 sm:block",
                    isCompleted && "text-primary",
                    isCurrent && "font-medium text-accent",
                    !isCompleted && !isCurrent && "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
