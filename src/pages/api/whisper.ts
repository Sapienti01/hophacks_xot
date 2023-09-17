/* eslint-disable */
import axios from "axios";
import fs from "fs";
import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { TranscriptionCreateParams } from "openai/resources/audio";
import { api } from "~/utils/api";
import FormData from "form-data";

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? "";

export const config = {
  runtime: "edge",
};

//openai function call whisper
const handler = async (req: NextRequest): Promise<Response> => {
  console.log("entering whisper");
  const { whisperData } = (await req.json()) as {
    whisperData: FormData;
  };

  whisperData.append("model", "whisper-1");
  whisperData.append("language", "en");

  const config = {
    method: "POST",
    maxBodyLength: Infinity,
    url: "https://api.openai.com/v1/audio/transcriptions",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "multipart/form-data",
      ...whisperData.getHeaders(),
    },
    data: whisperData,
  };
  const response = await axios.request(config);
  const transcribed = response.data;
  console.log("exiting whisper");
  return new Response(transcribed, { status: 200 });
};

export default handler;
