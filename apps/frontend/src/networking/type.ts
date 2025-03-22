export interface ReceiptData {
  image: string;
  address: string;
  deviceID: string;
}

export interface Validation {
  isValid: boolean;
  reason: string;
}

export interface Response {
  bagType: 'recyclable' | 'non-recyclable';
  receiptDetected: boolean;
  receiptValid: boolean;
  confidenceScore: number;
  validation: Validation;
  detailedAnalysis: string;
  message?: string;
  validityFactor?: number;
  descriptionOfAnalysis?: string;
}
