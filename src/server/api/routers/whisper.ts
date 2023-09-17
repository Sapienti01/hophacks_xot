/* eslint-disable */
import { z } from "zod";
import { StartMedicalTranscriptionJobCommand, GetMedicalTranscriptionJobCommand} from "@aws-sdk/client-transcribe";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const whisperRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ key: z.string(), userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { key } = input;
      const uri = "s3://hophacks-bucket/" + key;
      await ctx.db.example.create({
        data: {
          name: "test",
        },
      });


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
          while (true) {
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
              const t = ctx.db.transcription.create({
                data: {
                  userId: input.userId,
                  data: transcript,
                  audioId: "medical/" + key + "-transcription.json",
                },
              });
              const a = ctx.db.appointmentDetails.create({
                data: {
                  type: "",
                  name: "",
                  DoctorName: "",
                }
              })
              return t;
            }
            else if (data.MedicalTranscriptionJob?.TranscriptionJobStatus == "FAILED") {
              throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An unexpected error occurred, please try again later.',
                // optional: pass the original error to retain stack trace
              });
            }
          }
        } catch (err) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred, please try again later.',
            // optional: pass the original error to retain stack trace
          });
        }

    }),
});
