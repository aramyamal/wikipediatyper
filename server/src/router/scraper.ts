import express, { Request, Response } from "express";
import { WikipediaTyperService } from "../service/wikipediaTyper";
import { Article } from "../model/article.interface";

const wikipediaTyperService = new WikipediaTyperService();

export const scraperRouter = express.Router();

scraperRouter.get("/:wikipediaUrl", async (
    req: Request<{ wikipediaUrl: string }>,
    res: Response<Article | string>
) => {
    try {
        const { wikipediaUrl } = req.params;
        let article: Article = await wikipediaTyperService.scrape(wikipediaUrl);
        res.status(200).send(article);
    } catch (e: any) {
        res.status(500).send(e.message);
    }
});

