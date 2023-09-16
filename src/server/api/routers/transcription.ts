import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const transcriptionRouter = createTRPCRouter({
    getTranscription: publicProcedure
        .input(z.object({id : z.number()}))
        .query (async ({ input, ctx }) => {
            const transcription = await ctx.db.transcription.findUnique({
                where: {
                    id: input.id,
                },
            });
            return transcription;
        }
        ),
    
    getUsersTranscription: publicProcedure
        .input(z.object({userId : z.string()}))
        .query (async ({ input, ctx }) => {
            const transcriptions = await ctx.db.transcription.findMany({
                where: {
                    userId: input.userId,
                },
                select: {
                    appointmentDetails: true
                }
            });
            return transcriptions;
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
    
        
    });