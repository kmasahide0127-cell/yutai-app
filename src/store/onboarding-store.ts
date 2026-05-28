"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type OnboardingState = {
  currentStep: number;
  interests: string[];
  expenseCategories: string[];
  brands: string[];
  maxInvestment: number | null;
  setCurrentStep: (step: number) => void;
  setInterests: (interests: string[]) => void;
  setExpenseCategories: (categories: string[]) => void;
  setBrands: (brands: string[]) => void;
  setMaxInvestment: (amount: number | null) => void;
  reset: () => void;
};

const initialState = {
  currentStep: 1,
  interests: [],
  expenseCategories: [],
  brands: [],
  maxInvestment: null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      setCurrentStep: (currentStep) => set({ currentStep }),
      setInterests: (interests) => set({ interests }),
      setExpenseCategories: (expenseCategories) => set({ expenseCategories }),
      setBrands: (brands) => set({ brands }),
      setMaxInvestment: (maxInvestment) => set({ maxInvestment }),
      reset: () => set(initialState),
    }),
    {
      name: "yutai-onboarding",
      version: 2, // 出費カテゴリ再設計(v1→v2)で旧localStorageを自動破棄
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
