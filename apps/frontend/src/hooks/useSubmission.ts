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
        validation: response.validation ?? {
          validityFactor: response.confidenceScore > 0.8 ? 1 : 0,
          descriptionOfAnalysis:
            response.detailedAnalysis || response.message || "⚠️ No validation data received.",
        },
        detailedAnalysis: response.detailedAnalysis ?? "⚠️ No detailed analysis provided.",
        receiptDetected: Boolean(response.receiptDetected), // ✅ Ensures it's always a boolean
        receiptValid: Boolean(response.receiptValid), // ✅ Ensures it's always a boolean
      },
    });
  },

  clearAll: () => set({ isLoading: false, response: null }),
}));
