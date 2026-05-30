"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PreferenceTag } from "@/lib/matching";

export type VehicleType = "gasoline" | "ev" | "none" | null;

type OnboardingState = {
  currentStep: number;
  expenseCategories: string[];
  householdSize: number;
  brands: string[];
  maxInvestment: number | null;
  vehicleType: VehicleType;
  preferenceTags: PreferenceTag[];
  setCurrentStep: (step: number) => void;
  setExpenseCategories: (categories: string[]) => void;
  setHouseholdSize: (n: number) => void;
  setBrands: (brands: string[]) => void;
  setMaxInvestment: (amount: number | null) => void;
  setVehicleType: (type: VehicleType) => void;
  setPreferenceTags: (tags: PreferenceTag[]) => void;
  togglePreferenceTag: (tag: PreferenceTag) => void;
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
      reset: () => set(initialState),
    }),
    {
      name: "yutai-onboarding",
      version: 5, // preferenceTags追加(v4→v5)で旧localStorageを自動破棄
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
