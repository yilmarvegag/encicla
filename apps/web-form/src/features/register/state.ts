import { create } from "zustand";

type RegState = {
  id?: string;
  step1?: any;
  step2?: any;
  step3?: any;
  setId: (id: string) => void;
  setStep: (k: "step1" | "step2" | "step3", v: any) => void;
};

export const useReg = create<RegState>((set) => ({
  setId: (id) => set({ id }),
  setStep: (k, v) => set((s) => ({ ...s, [k]: v })),
}));
