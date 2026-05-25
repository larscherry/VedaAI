import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const questionGenerationQueue = new Queue("question-generation", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const pdfExportQueue = new Queue("pdf-export", {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
