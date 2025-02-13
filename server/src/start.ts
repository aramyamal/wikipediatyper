import express from "express";
import cors from "cors";
import { wikipediaTyperRouter } from "./router/wikipediaTyper";

export const app = express();

app.use(express.json());
app.use(cors());
app.use("/", wikipediaTyperRouter);

