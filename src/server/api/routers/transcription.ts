import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { currentUser, useUser } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/dist/types/server-helpers.server";
import { User } from "@clerk/nextjs/dist/types/server";

export const transcriptionRouter = createTRPCRouter({
  getTranscription: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const transcription = await ctx.db.transcription.findUnique({
        where: {
          id: input.id,
        },
        include: {
          appointmentDetails: true,
        },
      });
      return transcription;
    }),

  getUsersTranscription: publicProcedure
    .input(z.object({}))
    .query(async ({ input, ctx }) => {
      const { user } = useUser();
      if (!user) {
        throw new Error("User not found");
      }
      const transcriptions = await ctx.db.transcription.findMany({
        where: {
          userId: user.id,
        },
        include: {
          appointmentDetails: true,
        },
      });
      return transcriptions || [];
    }),

  getUsersTranscriptionForTable: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const transcriptions = await ctx.db.transcription.findMany({
        where: {
          userId: input.userId,
        },
        include: {
          appointmentDetails: true,
        },
      });
      const newData = transcriptions.map((transcription) => {
        return {
          id: transcription.id,
          name: transcription.appointmentDetails
            ? transcription.appointmentDetails.name
            : "Unnamed Transcription",
          date: transcription.createdAt.toLocaleString(),
        };
      });
      return newData;
    }),

  deleteTranscription: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const transcription = await ctx.db.transcription.delete({
        where: {
          id: input.id,
        },
      });
      return transcription;
    }),

  updateTranscription: publicProcedure
    .input(z.object({ id: z.string(), data: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const transcription = await ctx.db.transcription.update({
        where: {
          id: input.id,
        },
        data: {
          data: input.data,
        },
      });
      return transcription;
    }),
  updateSimplified: publicProcedure
    .input(z.object({ id: z.string(), data: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const transcription = await ctx.db.transcription.update({
        where: {
          id: input.id,
        },
        data: {
          simplifiedData: input.data,
        },
      });
      return transcription;
    }),
  updateQuestions: publicProcedure
    .input(z.object({ id: z.string(), data: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const transcription = await ctx.db.transcription.update({
        where: {
          id: input.id,
        },
        data: {
          questions: input.data,
        },
      });
      return transcription;
    }),
  updateInsights: publicProcedure
    .input(z.object({ id: z.string(), data: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const transcription = await ctx.db.transcription.update({
        where: {
          id: input.id,
        },
        data: {
          insights: input.data,
        },
      });
      return transcription;
    }),
});
