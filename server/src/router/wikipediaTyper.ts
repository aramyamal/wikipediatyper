import express, { Request, Response } from "express";
import { WikipediaTyperService } from "../service/wikipediaTyper";
import { Article } from "../model/article.interface";

const wikipediaTyperService = new WikipediaTyperService();

export const wikipediaTyperRouter = express.Router();

wikipediaTyperRouter.get("/:wikipediaURL(*)", async (
    req: Request<{ wikipediaURL: string }>,
    res: Response<Article | string>
) => {
    try {
        const { wikipediaURL } = req.params;
        if (/^https?:\/\//.test(wikipediaURL)) { //redirect to url without https
            res.status(301).redirect(wikipediaURL.replace(/https:\/\//, "/"));;
            return;
        }
        let article: Article = await wikipediaTyperService.scrape(wikipediaURL);
        res.status(200).send(article);
    } catch (e: any) {
        res.status(500).send(e.message);
    }
});

