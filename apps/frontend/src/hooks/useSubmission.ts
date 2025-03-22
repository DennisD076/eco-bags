import { create } from "zustand";
import { Response } from "../networking";

interface useSubmissionState {
  isLoading: boolean;
  response: Response | null;
  setIsLoading: (isLoading: boolean) => void;
  setResponse: (response: Response) => void;
  clearAll: () => void;
}

export const useSubmission = create<useSubmissionState>((set) => ({
  isLoading: false,
  response: null,

  setIsLoading: (isLoading) => set({ isLoading }),

  setResponse: (response) => {
    console.log("🛠️ Storing response in Zustand:", response);

    set({
      response: {
        ...response,
        validation: {
          isValid: response.confidenceScore > 0.8,
          reason: response.detailedAnalysis || "No validation reason provided."
        },
        detailedAnalysis: response.detailedAnalysis || "⚠️ No detailed analysis provided.",
        receiptDetected: Boolean(response.receiptDetected),
        receiptValid: Boolean(response.receiptValid),
      },
    });
  },

  clearAll: () => set({ isLoading: false, response: null }),
}));
