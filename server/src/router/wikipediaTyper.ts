import express, { Request, Response } from "express";
import { HttpError } from "../errors/http_error";
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
    } catch (error: any) {
        if (error instanceof HttpError) {
            res.status(error.statusCode).send(error.message);
        } else if (error instanceof Error) {
            res.status(500).send(error.message);
        } else {
            res.status(500).send("Unknown error occurred");
        }
    }
});

