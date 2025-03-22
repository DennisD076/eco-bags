import axios from "axios";
import { ReceiptData, Response } from "./type";
import { backendURL } from "../config";

export const submitReceipt = async (data: ReceiptData): Promise<Response> => {
  try {
    const response = await axios.post(`${backendURL}/api/submitReceipt`, data);

    return response.data;
  } catch (error: unknown) {
    console.error("Error posting data:", error);
    throw error;
  }
};
