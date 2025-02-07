import express from "express";
import { wikipediaTyperRouter } from "./router/scraper";

export const app = express();

app.use(express.json());
app.use("/", wikipediaTyperRouter);

