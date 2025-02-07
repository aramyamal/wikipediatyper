import { Article } from "../model/article.interface";

export class WikipediaTyperService {

    async scrape(url: string) : Promise<Article> {
        return {title: "test"};
    }

}
