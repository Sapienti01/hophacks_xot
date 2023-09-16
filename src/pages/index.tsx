import { Center, Flex } from "@mantine/core";
import Recorder from "~/components/Recorder";

export default function Home() {
  return (
    <Flex justify="center" align="center" style={{ height: "80vh" }}>
      <Recorder />
    </Flex>
  );
}
