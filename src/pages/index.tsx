import { UserButton } from "@clerk/nextjs";
import { Center } from "@mantine/core";
import Head from "next/head";
import Link from "next/link";
import Recorder from "~/components/Recorder";

import { api } from "~/utils/api";

export default function Home() {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (

      <Center style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Recorder />
      </Center>

  );
}
