import { HttpException } from '@/exceptions/HttpException';
import { openAIHelper } from '@/server';
import { isBase64Image } from '@/utils/data';
import { Service } from 'typedi';

@Service()
export class OpenaiService {
  public async validateImage(image: string): Promise<unknown> {
    if (!isBase64Image(image)) throw new HttpException(400, 'Invalid image format');

    const prompt = `
    Analyze the provided image. The image MUST meet ALL of the following criteria:
        1. It must be a receipt.
        2. The receipt must be clearly legible.
        3. The receipt must be valid (not expired, not a duplicate, etc.).
    
    You MUST respond ONLY with the following JSON object format as a REST API endpoint:
    {
      "bagType": "recyclable" | "non-recyclable", // Type of bag shown in the image
      "receiptDetected": boolean, // Whether a receipt is detected in the image
      "receiptValid": boolean, // Whether the receipt is valid
      "confidenceScore": number, // Confidence score between 0 and 1
      "validation": {
        "isValid": boolean,
        "reason": string
      },
      "detailedAnalysis": string // Detailed explanation of the analysis
    }
    `;

    const gptResponse = await openAIHelper.askChatGPTAboutImage({
      base64Image: image,
      prompt,
    });

    const responseJSONStr = openAIHelper.getResponseJSONString(gptResponse);
    const cleanedJSONStr = openAIHelper.cleanChatGPTJSONString(responseJSONStr);
    return JSON.parse(cleanedJSONStr);
  }
}
// 2. It must not be a screenshot.
// 3. It must include the date of the purchase.
// 4. It must include the name of the store where the purchase was made.