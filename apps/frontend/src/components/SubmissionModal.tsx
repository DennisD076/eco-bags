import {
  Modal,
  ModalContent,
  ModalOverlay,
  VStack,
  Text,
  HStack,
} from "@chakra-ui/react";
import { useDisclosure, useSubmission } from "../hooks";
import loaderAnimation from "../assets/lottie/loader-json.json";
import Lottie from "react-lottie";
import { AirdropIcon, AlertIcon } from "./Icon";
import { useMemo } from "react";

export const SubmissionModal = () => {
  const { isLoading, response } = useSubmission();
  const { isOpen, onClose } = useDisclosure();

  console.log("📩 SubmissionModal - Received Response:", response);

  // Default response if `response` is null
  const finalResponse = response || {
    message: "",
    bagType: "unknown",
    confidenceScore: 0,
    receiptDetected: false,
    receiptValid: false,
    eligibleForRewards: false,
    validation: { validityFactor: 0, descriptionOfAnalysis: "" },
    detailedAnalysis: "",
  };

  const { bagType, receiptDetected, receiptValid, eligibleForRewards, validation } = finalResponse; //detailedAnalysis, message
  const validationMessage = validation?.descriptionOfAnalysis || "";

  // ✅ STRONGER SUCCESS CONDITION
  const isValid = eligibleForRewards && receiptValid && receiptDetected;

  // ✅ Success Messages
  const successMessage =
  eligibleForRewards && receiptValid
    ? "♻️ Great job! Your submission is valid, and you earned rewards!"
    : "✅ Submission accepted, but no rewards were given due to missing or invalid receipt.";


  // ✅ Failure Messages
 // **Failure Messages (Better Styling)**
// ✅ Improved Failure Messages with Stronger Wording
const failureMessage = !receiptDetected
  ? "🚫 No receipt found! Please ensure your receipt is clearly visible in the image."
  : !receiptValid
  ? "📅 Invalid receipt date! Please submit a receipt from today to qualify for rewards."
  : bagType === "plastic"
  ? "🚫 Plastic bags are NOT eligible for rewards. Use a recyclable bag next time!"
  : "🤖 AI couldn't classify your bag. Try again with better lighting or a clearer image.";



  // ✅ Render Content - Always Keeps Hook Order
  const renderContent = useMemo(
    () => (
      <VStack
        bgGradient={
          isValid
            ? "radial-gradient(76.36% 85.35% at 50.12% 27.48%, rgba(194, 254, 207, 0.82) 38.14%, rgba(144, 212, 254, 0.82) 100%), #7DF000"
            : "radial-gradient(76.36% 85.35% at 50.12% 27.48%, rgba(254, 207, 207, 0.82) 38.14%, rgba(254, 144, 144, 0.82) 100%), #FF7F7F"
        }
        minH={"40vh"}
        minW={"40vh"}
        borderRadius={16}
        justifyContent={"center"}
        alignItems={"center"}
      >
        {eligibleForRewards && receiptValid ? (
  <>
    <AirdropIcon size={200} color="#28A745" />
    <Text fontSize={32} fontWeight={600} color="green.600">
      ✅ Submission Approved!
    </Text>
    <HStack px={4}>
      <Text fontSize={18} fontWeight={500} color="green.700" textAlign={"center"}>
        {successMessage}
      </Text>
    </HStack>
  </>
) : (
  <>
    <AlertIcon size={200} color="#D23F63" />
    <Text fontSize={32} fontWeight={600} color="red.600">
      ❌ Submission Issue
    </Text>
    <HStack px={4}>
    <Text fontSize={16} fontWeight={500} textAlign="center" color="red.700">
  {failureMessage}
</Text>

    </HStack>
  </>
)}

      </VStack>
    ),
    [isValid, successMessage, failureMessage, validationMessage]
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} trapFocus={true} isCentered={true}>
      <ModalOverlay />
      <ModalContent minH={"40vh"} minW={"40vh"} borderRadius={16}>
        {isLoading ? (
          <Lottie options={{ loop: true, autoplay: true, animationData: loaderAnimation }} />
        ) : (
          renderContent
        )}
      </ModalContent>
    </Modal>
  );
};
