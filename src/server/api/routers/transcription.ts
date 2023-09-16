import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { currentUser, useUser } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/dist/types/server-helpers.server";
import { User } from "@clerk/nextjs/dist/types/server";

export const transcriptionRouter = createTRPCRouter({
    getTranscription: publicProcedure
        .input(z.object({id : z.string()}))
        .query (async ({ input, ctx }) => {
            const transcription = await ctx.db.transcription.findUnique({
                where: {
                    id: input.id,
                },
                select: {
                    appointmentDetails: true
                }
            });
            return transcription;
        }
        ),
    
    getUsersTranscription: publicProcedure
        .input(z.object({}))
        .query (async ({ input, ctx }) => {
            const {user} = useUser();
            if (!user) {
                throw new Error("User not found");
            }
            const transcriptions = await ctx.db.transcription.findMany({
                where: {
                    userId: user.id,
                },
                include: {
                    appointmentDetails: true
                }
            });
            return transcriptions || [];
        }),
    
        getUsersTranscriptionForTable: publicProcedure
        .input(z.object({
            userId: z.string()
        }))
        .query (async ({ input, ctx }) => {
            const transcriptions = await ctx.db.transcription.findMany({
                where: {
                    userId: input.userId,
                },
                include: {
                    appointmentDetails: true
                }
            });
            const newData = transcriptions.map((transcription) => {
                return {
                    id: transcription.id,
                    name: transcription.appointmentDetails ? transcription.appointmentDetails.name : "Unnamed Transcription",
                    date: transcription.createdAt.toLocaleString(),
                }
            })
            return newData;
        }),

    createTranscription: publicProcedure
        .input(z.object({ userId: z.string(), 
            data: z.string(),
            audioId: z.string(),
            name: z.string().optional()
        }))
        .mutation (async ({ input, ctx }) => {

            const transcription = await ctx.db.transcription.create({
                data: {
                    userId: input.userId,
                    data: input.data,
                    audioId: input.audioId,
                },
            });
            return transcription;
        }),
    
    deleteTranscription: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation (async ({ input, ctx }) => {
            const transcription = await ctx.db.transcription.delete({
                where: {
                    id: input.id,
                },
            });
            return transcription;
        })
    });