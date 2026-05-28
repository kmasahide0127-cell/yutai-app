"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type OnboardingState = {
  currentStep: number;
  expenseCategories: string[];
  householdSize: number;
  brands: string[];
  maxInvestment: number | null;
  setCurrentStep: (step: number) => void;
  setExpenseCategories: (categories: string[]) => void;
  setHouseholdSize: (n: number) => void;
  setBrands: (brands: string[]) => void;
  setMaxInvestment: (amount: number | null) => void;
  reset: () => void;
};

const initialState = {
  currentStep: 1,
  expenseCategories: [],
  householdSize: 1,
  brands: [],
  maxInvestment: null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      setCurrentStep: (currentStep) => set({ currentStep }),
      setExpenseCategories: (expenseCategories) => set({ expenseCategories }),
      setHouseholdSize: (householdSize) => set({ householdSize }),
      setBrands: (brands) => set({ brands }),
      setMaxInvestment: (maxInvestment) => set({ maxInvestment }),
      reset: () => set(initialState),
    }),
    {
      name: "yutai-onboarding",
      version: 3, // 興味ステップ削除→世帯人数追加(v2→v3)で旧localStorageを自動破棄
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
