import axios from "axios";
import { ReceiptData } from "./type";
import { backendURL } from "../config";

export type Response = {
  bagType: "plastic" | "recyclable" | "not_detected";
  eligibleForRewards: boolean;
  confidenceScore: number;
  receiptDetected: boolean; // ✅ Whether a receipt is present
  receiptValid: boolean; // ✅ Whether the receipt has today's date
  validation?: {
    validityFactor: number;
    descriptionOfAnalysis: string;
  };
  detailedAnalysis?: string; // ✅ AI-generated analysis message
  message?: string;
};

export const submitReceipt = async (data: ReceiptData): Promise<Response> => {
  try {
    console.log("📤 Sending receipt data to backend:", data);

    const response = await axios.post(`${backendURL}/submitReceipt`, data, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log("✅ Backend Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error posting data:", error);

    // Extract error response from Axios
    if (error.response) {
      console.log("⚠️ Backend returned an error:", error.response.data);
      return error.response.data; // ✅ Return backend error response instead of throwing
    }

    throw error;
  }
};
