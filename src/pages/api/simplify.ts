import {
  createParser,
  type EventSourceParseCallback,
  type EventSourceParser,
  type ParsedEvent,
  type ReconnectInterval,
} from "eventsource-parser";
import type { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

const handler = async (req: NextRequest): Promise<Response> => {
  const { prompt } = (await req.json()) as {
    prompt?: string;
  };

  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }

  const payload = {
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "You are an expert at simplifying transcripts of Doctor-Patient meetings, particularly where the Doctor may be using verbose language. Your goal is to edit the transcript such that any esoteric language is conveyed more easily to the Patient without changing the meaning of the conversation. Please simplify the provided transcript. ",
      },
      { role: "user", content: prompt },
    ],
    top_p: 1,
    stream: true,
  };
  const stream = await OpenAIStream(payload);
  return new Response(stream, { status: 200 });
};

export default handler;

async function OpenAIStream(payload: {
  model: string;
  messages: { role: string; content: string }[];
  top_p: number;
  stream: boolean;
}) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? ""}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  const stream = new ReadableStream({
    async start(controller) {
      // callback
      const onParse: EventSourceParseCallback = (
        event: ParsedEvent | ReconnectInterval,
      ) => {
        if (event.type === "event") {
          const data: string = event.data;
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const json = JSON.parse(data);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const text: string = json.choices[0].delta?.content || "";
            if (counter < 2 && (text.match(/\n/) ?? []).length) {
              // this is a prefix character (i.e., "\n\n"), do nothing
              return;
            }
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            // maybe parse error
            controller.error(e);
          }
        }
      };

      // stream response (SSE) from OpenAI may be fragmented into multiple chunks
      // this ensures we properly read chunks and invoke an event for each SSE event stream
      const parser: EventSourceParser = createParser(onParse);
      // https://web.dev/streams/#asynchronous-iteration
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk as BufferSource));
      }
    },
  });

  return stream;
}
