/* eslint-disable */
import { z } from "zod";
import { StartMedicalTranscriptionJobCommand, GetMedicalTranscriptionJobCommand} from "@aws-sdk/client-transcribe";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const whisperRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ key: z.string(), userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { key } = input;
      const uri = "s3://hophacks-bucket/" + key;
      console.log(uri);

     const params2 = {
        MedicalTranscriptionJobName: key + "-transcription", // Required
        OutputBucketName: "tarikbuckettesting", // Required
        Specialty: "PRIMARYCARE", // Required. Possible values are 'PRIMARYCARE'
        Type: "CONVERSATION", // Required. Possible values are 'CONVERSATION' and 'DICTATION'
        LanguageCode: "en-US", // For example, 'en-US'
        MediaFormat: "webm", // For example, 'wav'
        Media: {
          MediaFileUri: uri,
        },
      };
        try {
          const data = await ctx.transcribeClient.send(
            new StartMedicalTranscriptionJobCommand(params2)
          );
          console.log("Success - put", data);
          const func = async () => {
            const data = await ctx.transcribeClient.send(
              new GetMedicalTranscriptionJobCommand({
                "MedicalTranscriptionJobName": key + "-transcription"
              }
            ));
            if (data.MedicalTranscriptionJob?.TranscriptionJobStatus == "COMPLETED") {
              console.log("Success - get", data)
              const file = await ctx.s3.getObject({
                Bucket: "tarikbuckettesting",
                Key: "medical/" + key + "-transcription.json"
              });
              const ans = await file.Body?.transformToString("utf-8");
              const son = JSON.parse(ans as string)
              const transcript = son.results.transcripts[0].transcript
              ctx.db.transcription.create({
                data: {
                  userId: "1",
                  data: transcript,
                  audioId: "medical/" + key + "-transcription.json",
                },
              });
              clearInterval(intervalId);
              return data;
            }
            else if (data.MedicalTranscriptionJob?.TranscriptionJobStatus == "FAILED") {
              clearInterval(intervalId);
              console.log("Error");
            }
          }
          const intervalId = setInterval(func, 5000);
        } catch (err) {
          console.log("Error", err);
        }

    }),
});
