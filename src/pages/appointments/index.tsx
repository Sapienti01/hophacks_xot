import { Center, Stack, Title } from "@mantine/core";
import Recorder from "~/components/Recorder";
import { TableSort } from "~/components/Table";
import { data } from "./data.json";

export default function Home() {

  return (
      <Center style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack>
        <Title>Your Past Appointmens</Title>
          <TableSort data={data}/>
          </Stack>
      </Center>
      
  );
}
