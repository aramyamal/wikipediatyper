import { Article } from "../model/article.interface";
import { WikiResponse } from "../model/wikiresponse.interface";
import { HttpError } from "../errors/http_error";
import axios from "axios";

export class WikipediaTyperService {

    private getWikiApi(language: string): string {
        return "https://" + language + ".wikipedia.org/w/api.php";
    }

    async scrape(url: string)/* : Promise<Article> */ {

        if (!url) {
            throw new HttpError(400, "No article URL provided.")
        }

        const language: string | undefined = url.match(/^[a-zA-Z]*/)?.[0];
        if (!language) {
            throw new HttpError(400, "Incorrect url format: no language code.");
        }

        const title: string | undefined = url.match(/\/wiki\/([^#?]+)/)?.[1];
        if (!title) {
            throw new HttpError(400, "Incorrect url format: no title provided.");
        }

        const { data } = await axios.get<WikiResponse>(this.getWikiApi(language), {
            params: {
                action: "query",
                prop: "extracts",
                exlimit: 1,
                titles: title,
                explaintext: 1,
                format: "json",
                formatversion: 2
            }
        })

        const page = data.query.pages[0];

        if (page.missing || !page.extract) {
            throw new HttpError(404, "Article not found");
        }

        return page;
    }

}
