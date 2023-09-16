import { exampleRouter } from "~/server/api/routers/example";
import { createTRPCRouter } from "~/server/api/trpc";
import { s3Router } from "./routers/s3";
import { appointmentDetailsRouter } from "./routers/appointmentdetails";
import { transcriptionRouter } from "./routers/transcription";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  s3: s3Router,
  appointmentDetails: appointmentDetailsRouter,
  transcription: transcriptionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
