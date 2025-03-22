import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Box, Text, VStack, useToast, Spinner, Center, Button } from "@chakra-ui/react";
import { ScanIcon } from "./Icon";
import { blobToBase64, getDeviceId, resizeImage } from "../util";
import { useWallet, useWalletModal } from "@vechain/dapp-kit-react";
import { submitReceipt } from "../networking";
import { useDisclosure, useSubmission } from "../hooks";
import { FaWallet } from "react-icons/fa6";

export const Dropzone = () => {
  const { account } = useWallet();
  const { open } = useWalletModal();
  const toast = useToast();
  const { setIsLoading, setResponse, isLoading } = useSubmission();
  const { onOpen } = useDisclosure();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      onFileUpload(acceptedFiles);
    },
    maxFiles: 1,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB limit
  });

  const onFileUpload = useCallback(
    async (files: File[]) => {
      if (files.length > 1 || files.length === 0) {
        toast({
          title: "Invalid file selection",
          description: "Please upload exactly one file",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (!account) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to upload receipts and sustainable bags",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      setIsLoading(true);
      onOpen();

      const file = files[0];

      try {
        const resizedBlob = await resizeImage(file);
        const base64Image = await blobToBase64(resizedBlob as Blob);
        const deviceID = await getDeviceId();

        const response = await submitReceipt({
          address: account,
          deviceID,
          image: base64Image,
        });

        setResponse(response);
        toast({
          title: "Success",
          description: "Receipt uploaded successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Upload error:", error);
        toast({
          title: "Upload failed",
          description: "There was an error processing your receipt  and bag. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [account, onOpen, setIsLoading, setResponse, toast],
  );

  if (!account) {
    return (
      <VStack w="full" mt={3}>
        <Center
          p={5}
          border="2px"
          borderColor="gray.300"
          borderStyle="dashed"
          borderRadius="lg"
          bg="gray.50"
          textAlign="center"
          w="full"
          h="200px"
        >
          <VStack spacing={4}>
            <Text color="gray.600" fontSize="sm">
              Please connect your wallet to upload receipts and sustainable bags
            </Text>
            <Button
              onClick={open}
              bg="green.500"
              color="white"
              size="md"
              leftIcon={<FaWallet />}
              px={6}
              py={2}
              fontWeight="500"
              letterSpacing="0.5px"
              rounded="full"
              transition="all 0.2s"
              _hover={{
                bg: "green.400",
                transform: "translateY(-1px)",
                boxShadow: "lg",
              }}
              _active={{
                bg: "green.600",
                transform: "translateY(0)",
              }}
            >
              Connect Wallet
            </Button>
          </VStack>
        </Center>
      </VStack>
    );
  }

  return (
    <VStack w="full" mt={3}>
      <Box
        {...getRootProps()}
        p={5}
        border="2px"
        borderColor={isDragActive ? "green.300" : "gray.300"}
        borderStyle="dashed"
        borderRadius="lg"
        bg={isDragActive ? "green.50" : "gray.50"}
        textAlign="center"
        cursor={isLoading ? "not-allowed" : "pointer"}
        _hover={{
          borderColor: isLoading ? "gray.300" : "green.500",
          bg: isLoading ? "gray.50" : "green.50",
        }}
        w="full"
        h="200px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        transition="all 0.2s"
      >
        <input {...getInputProps()} disabled={isLoading} />
        {isLoading ? (
          <VStack spacing={3}>
            <Spinner size="lg" color="green.500" />
            <Text color="gray.600" fontSize="sm">Processing your receipt & Bag...</Text>
          </VStack>
        ) : (
          <VStack spacing={3}>
            <ScanIcon size={60} color={isDragActive ? "green.500" : "gray.400"} />
            <Text fontSize="sm" color="gray.700" fontWeight="medium">
              {isDragActive ? "Drop your receipt and bag here" : "Drag & drop your receipts and sustainable bags"}
            </Text>
            <Text fontSize="xs" color="gray.500">
              or click to browse
            </Text>
            <Text fontSize="2xs" color="gray.400">
              Supported formats: PNG, JPG, JPEG, WEBP (max 10MB)
            </Text>
          </VStack>
        )}
      </Box>
    </VStack>
  );
};
