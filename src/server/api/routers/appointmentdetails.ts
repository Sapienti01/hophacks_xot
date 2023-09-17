import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const appointmentDetailsRouter = createTRPCRouter({
    getAppointmentDetails: publicProcedure
        .input(z.object({id : z.string()}))
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
            transriptionId: z.string(),
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

        updateAppointmentDetails: publicProcedure
            .input(z.object({ id: z.string(), recName: z.string(), aptType: z.string(), drName: z.string() }))
            .mutation (async ({ input, ctx }) => {
                const appointment = await ctx.db.appointmentDetails.update({
                    where: {
                        id: input.id,
                    },
                    data: {
                        name: input.recName,
                        type: input.aptType,
                        DoctorName: input.drName,
                    },
                });
                return appointment;
            }),
    
        
    });