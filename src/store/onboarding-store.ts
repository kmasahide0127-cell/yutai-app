"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type OnboardingState = {
  currentStep: number;
  interests: string[];
  lifestyleTags: string[];
  brands: string[];
  maxInvestment: number | null;
  setCurrentStep: (step: number) => void;
  setInterests: (interests: string[]) => void;
  setLifestyleTags: (tags: string[]) => void;
  setBrands: (brands: string[]) => void;
  setMaxInvestment: (amount: number | null) => void;
  reset: () => void;
};

const initialState = {
  currentStep: 1,
  interests: [],
  lifestyleTags: [],
  brands: [],
  maxInvestment: null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      setCurrentStep: (currentStep) => set({ currentStep }),
      setInterests: (interests) => set({ interests }),
      setLifestyleTags: (lifestyleTags) => set({ lifestyleTags }),
      setBrands: (brands) => set({ brands }),
      setMaxInvestment: (maxInvestment) => set({ maxInvestment }),
      reset: () => set(initialState),
    }),
    {
      name: "yutai-onboarding",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
    }
  )
);
