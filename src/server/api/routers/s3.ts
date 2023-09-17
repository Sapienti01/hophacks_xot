/* eslint-disable */
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";
import {
  GetObjectCommand,
  PutObjectCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import fs from "fs";
import FormData from "form-data";
import { get } from "http";

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
  getObjAsFormData: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const { key } = input;
        const { s3 } = ctx;
        const whisperData = new FormData();

        // Set the parameters for the S3 getObject operation
        const params = {
          Bucket: process.env.BUCKET_NAME,
          Key: key,
        };

        const getObjectCommand = new GetObjectCommand(params);
        const objectStream = await s3.send(getObjectCommand);

        whisperData.append("file", objectStream.Body);
        return whisperData;
      } catch (error) {
        console.error(
          "An error occurred while retrieving the S3 audio file:",
          error,
        );
        throw error;
      }
    }),
});
