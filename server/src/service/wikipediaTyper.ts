import { Article } from "../model/article.interface";
import { WikiResponse } from "../model/wikiresponse.interface";
import axios from "axios";

export class WikipediaTyperService {

    private getWikiApi(language: string): string {
        return "https://" + language + ".wikipedia.org/w/api.php";
    }

    async scrape(url: string)/* : Promise<Article> */ {

        if (!url) {
            throw new Error("No url provided.");
        }

        const language: string | undefined = url.match(/^[a-zA-Z]*/)?.[0];
        if (!language) {
            throw new Error("Incorrect url format: no language code.");
        }

        const title: string | undefined = url.match(/\/wiki\/([^#?]+)/)?.[1];
        if (!title) {
            throw new Error("Incorrect url format: no title.");
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
            throw new Error("Article does not exist.")
        }

        return page;
    }

}
