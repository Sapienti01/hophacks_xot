/* eslint-disable*/
import { GetObjectCommand } from "@aws-sdk/client-s3";

import { S3 } from "@aws-sdk/client-s3";
import type { NextRequest } from "next/server";
import FormData from "form-data";
import { Routes } from "~/utils/types";

const s3 = new S3();

const handler = async (req: NextRequest): Promise<Response> => {
  console.log("entering getS3andWhisper");
  const whisperData = new FormData();
  console.log("hi");
  const { key } = (await req.json()) as {
    key: string;
  };
  console.log(key);

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
  };

  const getObjectCommand = new GetObjectCommand(params);
  const objectStream = await s3.send(getObjectCommand);

  whisperData.append("file", objectStream.Body);

  console.log("calling whisper");
  const response = await fetch(Routes.whisper, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ whisperData }),
  });

  const data = await response.json();

  console.log("exiting getS3andWhisper");
  return new Response(data, { status: 200 });
};

export default handler;
