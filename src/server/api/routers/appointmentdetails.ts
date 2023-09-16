import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const appointmentDetailsRouter = createTRPCRouter({
    getAppointmentDetails: publicProcedure
        .input(z.object({id : z.number()}))
        .query (async ({ input, ctx }) => {
            const appointment = await ctx.db.appointmentDetails.findUnique({
                where: {
                    id: input.id,
                },
            });
            return appointment;
        }
        ),
    
    createAppointmentDetails: publicProcedure
        .input(z.object({ userId: z.string(), 
            name: z.string(),
            type: z.string(),
            Date: z.date(),
            DrName: z.string(),
            transriptionId: z.number(),
        }))
        .mutation (async ({ input, ctx }) => {

            const transcription = await ctx.db.appointmentDetails.create({
                data: {
                    name: input.name,
                    type: input.type,
                    Date: input.Date,
                    DoctorName: input.DrName,
                    Transcription: {
                        connect: {
                            id: input.transriptionId,
                        }
                    }
                },
            });
            return transcription;
        }),
    
        
    });