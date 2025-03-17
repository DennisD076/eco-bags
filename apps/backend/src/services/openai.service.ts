import { HttpException } from '@/exceptions/HttpException';
import { openAIHelper } from '@/server';
import { isBase64Image } from '@/utils/data';
import { Service } from 'typedi';

interface Validation {
  validityFactor: number;
  descriptionOfAnalysis: string;
}

interface BagAnalysisResponse {
  bagType: 'plastic' | 'recyclable' | 'not_detected';
  eligibleForRewards: boolean;
  confidenceScore: number;
  receiptDetected: boolean; // ✅ New field for receipt detection
  receiptValid: boolean; // ✅ New field for date validation
  validation?: Validation;
}

@Service()
export class OpenaiService {
  public async validateImage(image: string): Promise<BagAnalysisResponse & { validation: Validation, detailedAnalysis: string }> {
    if (!isBase64Image(image)) {
      console.error('❌ Invalid image format detected');
      throw new HttpException(400, 'Invalid image format');
    }

    // 🌍 Get the user's local date in their time zone
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const todayLocal = new Date().toLocaleDateString('en-CA', { timeZone: userTimeZone }); // YYYY-MM-DD format

    const prompt = `
      Analyze the provided image and determine:
      1. **If a plastic bag, recyclable bag, or no bag is present.**
      2. **If a receipt is visible in the image.**
      3. **If the receipt contains today's date (${todayLocal}).**
      
      ### **Classification Rules**
      - If the image contains a **plastic bag**, classify it as **"plastic"** and set **eligibleForRewards = false**.
      - If the image contains a **recyclable bag** (paper, fabric, biodegradable), classify it as **"recyclable"** and set **eligibleForRewards = true**.
      - If the image does not clearly contain a bag, classify it as **"not_detected"** and set **eligibleForRewards = false**.
      - If a **receipt is visible**, set **receiptDetected = true**.
      - If a receipt contains **today's date (${todayLocal})**, set **receiptValid = true**. Otherwise, set **receiptValid = false**.
      
      ### **Important**
      - **If a receipt is detected but the date is incorrect, specify the issue clearly.**
      - **If the receipt is missing, emphasize that no receipt was detected.**
      
      ### **Response Format**
      ALWAYS respond with **ONLY** this JSON structure:
      \`\`\`json
      {
        "bagType": "{bagType}", // "plastic", "recyclable", or "not_detected"
        "eligibleForRewards": {true/false}, // true if "recyclable", false otherwise
        "confidenceScore": {confidenceNumber}, // Confidence score (0-1) on classification accuracy
        "receiptDetected": {true/false}, // true if a receipt is visible
        "receiptValid": {true/false} // true if the receipt contains today's date
      }
      \`\`\`
    `;

    try {
      console.log(`📤 Sending image to OpenAI for validation... (User Time Zone: ${userTimeZone}, Date: ${todayLocal})`);
      const gptResponse = await openAIHelper.askChatGPTAboutImage({
        base64Image: image,
        prompt,
      });

      console.log('✅ OpenAI Response Received:', gptResponse);

      const responseJSONStr = openAIHelper.getResponseJSONString(gptResponse);
      console.log('📝 Raw JSON Response:', responseJSONStr);

      if (!responseJSONStr) {
        console.error('❌ OpenAI returned an empty response.');
        throw new HttpException(500, 'OpenAI returned an empty response');
      }

      const parsedResponse: BagAnalysisResponse | undefined =
        openAIHelper.parseChatGPTJSONString<BagAnalysisResponse>(responseJSONStr);

      console.log('🔍 Parsed Response:', parsedResponse);

      if (!parsedResponse || !parsedResponse.bagType) {
        console.error('❌ Invalid response from OpenAI:', parsedResponse);
        throw new HttpException(500, 'Invalid response from OpenAI');
      }

      // ✅ Generate detailed analysis
      // ✅ Generate a more user-friendly analysis
let detailedAnalysis = `🛍️ **Bag Type:** **${parsedResponse.bagType.toUpperCase()}** (Confidence: **${(parsedResponse.confidenceScore * 100).toFixed(1)}%**)`;

if (parsedResponse.receiptDetected) {
  if (parsedResponse.receiptValid) {
    detailedAnalysis += `\n\n📜 **Receipt Status:** ✅ **Valid** - The receipt date matches today's date.`;
  } else {
    detailedAnalysis += `\n\n⚠️ **Receipt Issue:** The receipt was **detected** but has an **incorrect date**. Please submit a receipt from **${todayLocal}**.`;
  }
} else {
  detailedAnalysis += `\n\n🚫 **Missing Receipt:** No receipt detected. Please ensure it's **clearly visible** in the image.`;
}

// ✅ Improved AI response formatting
return {
  ...parsedResponse,
  validation: {
    validityFactor: parsedResponse.confidenceScore > 0.8 ? 1 : 0,
    descriptionOfAnalysis: detailedAnalysis,
  },
  detailedAnalysis, // 🔥 Enhanced response for frontend
};

    } catch (error) {
      console.error('❌ Error processing image:', error);
      throw new HttpException(500, 'Error validating image');
    }
  }
}
