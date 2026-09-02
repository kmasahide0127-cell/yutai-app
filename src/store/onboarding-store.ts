"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PreferenceTag } from "@/lib/matching";

export type VehicleType = "gasoline" | "ev" | "none" | null;
export type PlanYears = 5 | 10 | null;

type OnboardingState = {
  currentStep: number;
  expenseCategories: string[];
  householdSize: number;
  brands: string[];
  maxInvestment: number | null;
  vehicleType: VehicleType;
  preferenceTags: PreferenceTag[];
  // 株式投資に使ってもよい総額の目安(円)。5年/10年プランの年間推奨予算算出に使う。
  totalStockBudget: number | null;
  // 優待カレンダーを何年かけて完成させるか。急いで埋める必要のない資産に余裕がある人向け。
  planYears: PlanYears;
  setCurrentStep: (step: number) => void;
  setExpenseCategories: (categories: string[]) => void;
  setHouseholdSize: (n: number) => void;
  setBrands: (brands: string[]) => void;
  setMaxInvestment: (amount: number | null) => void;
  setVehicleType: (type: VehicleType) => void;
  setPreferenceTags: (tags: PreferenceTag[]) => void;
  togglePreferenceTag: (tag: PreferenceTag) => void;
  setTotalStockBudget: (amount: number | null) => void;
  setPlanYears: (years: PlanYears) => void;
  reset: () => void;
};

const initialState = {
  currentStep: 1,
  expenseCategories: [],
  householdSize: 1,
  brands: [],
  maxInvestment: null,
  vehicleType: null as VehicleType,
  preferenceTags: [] as PreferenceTag[],
  totalStockBudget: null as number | null,
  planYears: null as PlanYears,
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
      setVehicleType: (vehicleType) => set({ vehicleType }),
      setPreferenceTags: (preferenceTags) => set({ preferenceTags }),
      togglePreferenceTag: (tag) =>
        set((state) => ({
          preferenceTags: state.preferenceTags.includes(tag)
            ? state.preferenceTags.filter((t) => t !== tag)
            : [...state.preferenceTags, tag],
        })),
      setTotalStockBudget: (totalStockBudget) => set({ totalStockBudget }),
      setPlanYears: (planYears) => set({ planYears }),
      reset: () => set(initialState),
    }),
    {
      name: "yutai-onboarding",
      version: 6, // totalStockBudget/planYears追加(v5→v6)で旧localStorageを自動破棄
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
