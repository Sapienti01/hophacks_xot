import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { PutObjectCommand, UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";

export const s3Router = createTRPCRouter({
  getObjects: publicProcedure.query(async ({ ctx }) => {
    const { s3 } = ctx;

    const listObjectsOutput = await s3.listObjectsV2({
      Bucket: process.env.BUCKET_NAME,
    });

    return listObjectsOutput.Contents ?? [];
  }),

  getStandardUploadPresignedUrl: publicProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { key } = input;
      const { s3 } = ctx;

      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: key,
      });

      return await getSignedUrl(s3, putObjectCommand);
    }),

});