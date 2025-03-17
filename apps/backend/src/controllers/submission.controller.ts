import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { OpenaiService } from '@/services/openai.service';
import { Submission } from '@/interfaces/submission.interface';
import { HttpException } from '@/exceptions/HttpException';
import { ContractsService } from '@/services/contracts.service';

export class SubmissionController {
  public openai = Container.get(OpenaiService);
  public contracts = Container.get(ContractsService);

  public submitReceipt = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      console.log("📥 Received /submitReceipt request:", req.body);

      const body: Omit<Submission, 'timestamp'> = req.body;
      const submissionRequest: Submission = {
        ...body,
        timestamp: Date.now(),
      };

      console.log("🚀 Validating image with OpenAI (Bag Type & Receipt Check)...");

      // Send image to OpenAI for validation (bag type & receipt check)
      const validationResult = await this.openai.validateImage(body.image);

      console.log("✅ OpenAI Response:", validationResult);

      if (!validationResult || typeof validationResult !== 'object') {
        console.error("❌ OpenAI response is invalid:", validationResult);
        throw new HttpException(500, "Invalid OpenAI response structure.");
      }

      if (!("bagType" in validationResult) || !("receiptDetected" in validationResult) || !("receiptValid" in validationResult)) {
        console.error("❌ Missing required properties in OpenAI response:", validationResult);
        throw new HttpException(500, "Error processing image: Missing required properties.");
      }

      const { bagType, confidenceScore, receiptDetected, receiptValid, validation, detailedAnalysis } = validationResult;

      console.log(`🔍 Detected Bag Type: ${bagType} (Confidence: ${confidenceScore})`);
      console.log(`🧾 Receipt Detected: ${receiptDetected}, Receipt Valid: ${receiptValid}`);

      // Determine eligibility properly
      const eligibleForRewards = receiptValid && bagType === "recyclable";

      // **No Receipt Detected**
      if (!receiptDetected) {
        return res.status(400).json({
          message: "❌ No receipt detected in the image. Please ensure the receipt is clearly visible.",
          bagType,
          confidenceScore,
          receiptDetected,
          receiptValid,
          eligibleForRewards: false, // ✅ No rewards if no receipt
          detailedAnalysis,
        });
      }

      // **Receipt Invalid (Wrong Date)**
      if (!receiptValid) {
        return res.status(400).json({
          message: "⚠️ Receipt detected, but the date is incorrect. Please submit a receipt from today.",
          bagType,
          confidenceScore,
          receiptDetected,
          receiptValid,
          eligibleForRewards: false, // ✅ No rewards if receipt is invalid
          detailedAnalysis,
        });
      }

      // **Plastic Bags Are Not Eligible**
      if (bagType !== "recyclable") {
        console.log("🚫 Plastic bag detected. No rewards granted.");
        return res.status(200).json({
          message: "⚠️ Plastic bags are not eligible for rewards.",
          bagType,
          confidenceScore,
          receiptDetected,
          receiptValid,
          eligibleForRewards: false, // ✅ No rewards if plastic bag
          detailedAnalysis,
        });
      }

      console.log("🎉 Recyclable bag detected. Proceeding with reward registration...");

      // **Smart Contract Validation**
      console.log("🔍 Validating submission with smart contract...");
      try {
        await this.contracts.validateSubmission(submissionRequest);
      } catch (validationError) {
        console.error("❌ Smart contract validation failed:", validationError);
        return res.status(500).json({
          message: `Smart contract validation error: ${validationError.message}`,
          bagType,
          confidenceScore,
          receiptDetected,
          receiptValid,
          eligibleForRewards: false, // ✅ No rewards if smart contract fails
          detailedAnalysis: "⚠️ Smart contract validation failed. Please try again.",
        });
      }
      console.log("✅ Submission validated successfully.");

      // **Register Submission in Smart Contract**
      console.log("📤 Registering submission with the smart contract...");
      let registrationSuccess;
      try {
        registrationSuccess = await this.contracts.registerSubmission(submissionRequest);
      } catch (contractError) {
        console.error("❌ Smart contract registration failed:", contractError);
        return res.status(500).json({
          message: `Smart contract submission error: ${contractError.message}`,
          bagType,
          confidenceScore,
          receiptDetected,
          receiptValid,
          eligibleForRewards: false, // ✅ No rewards if registration fails
          detailedAnalysis: "⚠️ Smart contract registration failed. Please try again.",
        });
      }

      if (!registrationSuccess) {
        console.error("❌ Smart contract rejected the submission.");
        return res.status(500).json({
          message: "Transaction failed: Smart contract did not confirm submission.",
          bagType,
          confidenceScore,
          receiptDetected,
          receiptValid,
          eligibleForRewards: false, // ✅ No rewards if contract rejects
          detailedAnalysis: "⚠️ Smart contract did not confirm the transaction. Please try again.",
        });
      }

      console.log("✅ Submission successfully registered! Rewards sent.");

      return res.status(200).json({
        message: "✅ Submission accepted! You earned rewards.",
        bagType,
        confidenceScore,
        receiptDetected,
        receiptValid,
        eligibleForRewards: true, // ✅ Only true if everything succeeds
        validation,
        detailedAnalysis,
      });

    } catch (error) {
      console.error("❌ Error in submitReceipt:", error);

      if (error instanceof HttpException) {
        return next(error);
      }

      return next(new HttpException(500, "An unexpected error occurred while processing the receipt."));
    }
  };
}
