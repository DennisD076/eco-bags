import { Card, Flex, Box } from "@chakra-ui/react";
import { Step } from "./Step";

const Steps = [
  {
    icon: "/steps/1.svg",
    title: "Use an Eco-friendly Bag",
    description: "Use an eco-friendly bag for your groceries or other shopping.",
  },
  {
    icon: "/steps/2.svg",
    title: "Upload a Picture",
    description: "Upload a picture of your eco-friendly bag along with the receipt.",
  },
  {
    icon: "/steps/3.svg",
    title: "Earn Rewards",
    description: "Earn B3TR tokens for using eco-friendly bags.",
  },
];

export const Instructions = () => {
  return (
    <Card 
      mt={5} 
      w="full" 
      p={6} 
      borderRadius="lg" 
     
      bg="transparant"
    >
      <Flex 
        w="100%" 
        direction="column" 
        align="center" 
        gap={6}
      >
        {Steps.map((step, index) => (
          <Box 
            key={index} 
            w="60%" 
            p={6} 
            borderRadius="xl" 
            bg="blue.50" 
            boxShadow="md" 
            textAlign="center"
            _hover={{
              bg: "blue.100", 
              transform: "scale(1.05)", 
              transition: "0.3s ease-in-out"
            }}
          >
            <Step {...step} />
          </Box>
        ))}
      </Flex>
    </Card>
  );
};
