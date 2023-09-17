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
import axios from "axios";

export const whisperRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { s3 } = ctx;
      const { key } = input;
      const whisperData = new FormData();

      // Set the parameters for the S3 getObject operation
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: key,
      };
      console.log(key)

      const getObjectCommand = new GetObjectCommand(params);
      const objectStream = await s3.send(getObjectCommand);

      whisperData.append("file", objectStream.Body);

      whisperData.append("model", "whisper-1");
      whisperData.append("language", "en");
      
      const Headers = {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        "Content-Type": "multipart/form-data",
        ...whisperData.getHeaders(),
      }
    
    // const config = {
    //   method: "POST",
    //   maxBodyLength: Infinity,
    //   url: "https://api.openai.com/v1/audio/transcriptions",
      // headers: {
      //   Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      //   "Content-Type": "multipart/form-data",
      //   ...whisperData.getHeaders(),
      // },
    //   data: whisperData,
    // };
    // const response = await axios.request(config);
      let ans;
    axios.post("https://api.openai.com/v1/audio/transcriptions", whisperData, { headers: Headers})
      .then(function (response) {
        console.log(response.data);
        ans = response.data;
      })
      .catch(function (error) {
        console.error(error);
      });

    const transcribed = ans;
    console.log(transcribed)
    }),
});
