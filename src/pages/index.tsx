import { Center } from "@mantine/core";
import Recorder from "~/components/Recorder";

export default function Home() {

  return (
      <Center style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Recorder />
      </Center>
      
  );
}
