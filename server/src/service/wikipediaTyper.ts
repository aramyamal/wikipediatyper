import { Article } from "../model/article.interface";
import { WikiResponse } from "../model/wiki_response.interface";
import { WikiArticle } from "../model/wiki_article.interface";
import { HttpError } from "../errors/http_error";
import axios from "axios";

export class WikipediaTyperService {

    private getWikiApi(language: string): string {
        return "https://" + language + ".wikipedia.org/w/api.php";
    }

    async scrape(url: string): Promise<WikiArticle> {

        if (!url) {
            throw new HttpError(400, "No article URL provided")
        }

        const language: string | undefined = url.split(".")[0];
        if (!language) {
            throw new HttpError(400, "Incorrect URL format: no language code");
        }
        if (language.length > 3) {
            throw new HttpError(400, "Incorrect URL format: no language code");
        }

        const title: string | undefined = url.match(/\/wiki\/([^#?]+)/)?.[1];
        if (!title) {
            throw new HttpError(400, "Incorrect URL format: no title provided");
        }

        const { data }: { data: WikiResponse } = await axios.get<WikiResponse>(
            this.getWikiApi(language),
            {
                params: {
                    action: "query",
                    prop: "extracts",
                    exlimit: 1,
                    titles: title,
                    explaintext: 1,
                    format: "json",
                    formatversion: 2
                },
                headers: {
                    "User-Agent": "wikipediatyper/1.0 "
                        + "(github.com/aramyamal/wikipediatyper)"
                }
            })

        const page = data.query.pages[0];

        if (page.missing || !page.extract) {
            throw new HttpError(404, "Article not found");
        }

        return page;
    }

    async prettify(wikiArticle: WikiArticle): Promise<Article> {
        return {
            title: "test",
            segments: []
        };
    }
}
