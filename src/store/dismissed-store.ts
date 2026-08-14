"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type DismissedState = {
  // 「興味なし」と評価した優待の証券コード一覧。以後の提案から除外する。
  dismissedCodes: string[];
  dismiss: (code: string) => void;
  restore: (code: string) => void;
  restoreAll: () => void;
};

export const useDismissedStore = create<DismissedState>()(
  persist(
    (set) => ({
      dismissedCodes: [],
      dismiss: (code) =>
        set((state) =>
          state.dismissedCodes.includes(code)
            ? state
            : { dismissedCodes: [...state.dismissedCodes, code] }
        ),
      restore: (code) =>
        set((state) => ({
          dismissedCodes: state.dismissedCodes.filter((c) => c !== code),
        })),
      restoreAll: () => set({ dismissedCodes: [] }),
    }),
    {
      name: "yutai-dismissed",
      version: 1,
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
