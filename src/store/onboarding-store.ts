"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type VehicleType = "gasoline" | "ev" | "none" | null;

type OnboardingState = {
  currentStep: number;
  expenseCategories: string[];
  householdSize: number;
  brands: string[];
  maxInvestment: number | null;
  vehicleType: VehicleType;
  setCurrentStep: (step: number) => void;
  setExpenseCategories: (categories: string[]) => void;
  setHouseholdSize: (n: number) => void;
  setBrands: (brands: string[]) => void;
  setMaxInvestment: (amount: number | null) => void;
  setVehicleType: (type: VehicleType) => void;
  reset: () => void;
};

const initialState = {
  currentStep: 1,
  expenseCategories: [],
  householdSize: 1,
  brands: [],
  maxInvestment: null,
  vehicleType: null as VehicleType,
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
      reset: () => set(initialState),
    }),
    {
      name: "yutai-onboarding",
      version: 4, // vehicleType追加(v3→v4)で旧localStorageを自動破棄
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
