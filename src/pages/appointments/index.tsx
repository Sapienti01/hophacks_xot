import { Center, Stack, Text, Title } from "@mantine/core";
import { TableSort } from "~/components/Table";
import { data } from "./data.json";
import { useUser } from "@clerk/nextjs";

export default function Home() {
  const {user} = useUser();
  if (!user) {
    return (
      <Text>No Auth</Text>
    )
  }
  return (
      <Center style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack>
        <Title>Your Past Appointmens</Title>
          <TableSort userId={user.id}/>
          </Stack>
      </Center>
      
  );
}
