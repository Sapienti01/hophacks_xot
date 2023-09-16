/* eslint-disable */
import axios from "axios";
import fs from "fs";
import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { TranscriptionCreateParams } from "openai/resources/audio";
import { api } from "~/utils/api";

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? "";
const openai = new OpenAI({ apiKey });

export const config = {
  runtime: "edge",
};

//openai function call whisper
const handler = async (req: NextRequest): Promise<Response> => {
  const { key } = (await req.json()) as {
    key: string;
  };
  const { data, isLoading } = api.s3.getObjAsFormData.useQuery({ key });

  if (data) {
    data.append("model", "whisper-1");
    data.append("language", "en");

    const config = {
      method: "POST",
      maxBodyLength: Infinity,
      url: "https://api.openai.com/v1/audio/transcriptions",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "multipart/form-data",
        ...data.getHeaders(),
      },
      data: data,
    };
    const response = await axios.request(config);
    const transcribed = response.data;
    return new Response(transcribed, { status: 200 });
  }
  return new Response("Error", { status: 500 });
};

export default handler;
