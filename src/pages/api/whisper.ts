import fs from "fs";
import type { NextRequest } from "next/server";
import OpenAI from "openai";

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? "";

//eslint-disable-next-line
const openai = new OpenAI({ apiKey });

export const config = {
  runtime: "edge",
};

//openai function call whisper
const handler = async (req: NextRequest): Promise<Response> => {
  //eslint-disable-next-line
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream("audio.mp3"),
    model: "whisper-1",
  });

  return new Response(transcription.text, { status: 200 });
};

export default handler;
