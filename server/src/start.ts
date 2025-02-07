import express from "express";
import { scraperRouter } from "./router/scraper";

export const app = express();

app.use(express.json());
app.use("/", scraperRouter);

