import {
  Box,
  Card,
  //HStack,
  Image,
  VStack,
  //Text,
  //Button,
  Flex,
 // Link,
} from "@chakra-ui/react";
//import { MdOutlineArrowOutward } from "react-icons/md";

export const InfoCard = () => {
  return (
    <Card w={"full"}>
      <Box p={3}>
        <VStack w={"full"} spacing={{ base: 2, md: 4 }}>
          <Image src="/ecology-bag-with-leaves.png" borderRadius={16} />
          <Flex
            w={"full"}
            justifyContent={"space-between"}
            direction={{ base: "column", md: "row" }}
            alignItems={"center"}
          >
            
            
          </Flex>
        </VStack>
      </Box>
    </Card>
  );
};
