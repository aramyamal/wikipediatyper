import { WikiArticle } from "./wiki_article.interface";

export interface WikiResponse {
    batchcomplete: boolean;
    query: {
        pages: WikiArticle[];
    };
}
