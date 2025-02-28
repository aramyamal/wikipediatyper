import { Article } from "../model/article.interface";
import { WikiResponse } from "../model/wiki_response.interface";
import { WikiArticle } from "../model/wiki_article.interface";
import { HttpError } from "../errors/http_error";
import axios from "axios";
import { ArticleSegment } from "../model/article_segment.interface";

export class WikipediaTyperService {

    private getWikiApi(language: string): string {
        return "https://" + language + ".wikipedia.org/w/api.php";
    }

    async scrape(url: string): Promise<Article> {

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

        return this.prettify(page);
    }

    async prettify(wikiArticle: WikiArticle): Promise<Article> {
        if (wikiArticle.missing || !wikiArticle.extract) {
            throw new HttpError(500, "Parsing empty article not allowed");
        }
        const rawSegments: string[] = wikiArticle.extract.split("\n")
            .filter(segment => segment.trim().length > 0);

        let articleSegments: ArticleSegment[] = [];

        for (const rawSegment of rawSegments) {
            // match headers like "== header2 ==", and "=== header3 ===" etc
            const headerMatch: RegExpMatchArray | null = rawSegment
                .match(/^(=+)\s*(.+?)\s*\1$/);

            if (headerMatch) {
                const level: number = headerMatch[1].length;
                const body: string = headerMatch[2].trim();

                articleSegments.push({
                    type: `header${level}`,
                    body: body
                });
            } else {
                articleSegments.push({
                    type: "text",
                    body: this.cleanText(rawSegment)
                })
            }
        }

        return {
            title: wikiArticle.title,
            segments: articleSegments
        };
    }

    private cleanText(text: string): string {
        return this.cleanCurlyBraces(text)
            // remove residue reference markers
            .replace(/:\s[0-9][0-9]*((\.|-|–)[0-9]*)*\s/g, "")
            // reduce multiple spaces to one
            .replace(/\s{2,}/g, " ")
            // replace all " ." with "."
            .replace(/\s\./g, ".");
    }

    private cleanCurlyBraces(text: string): string {
        let depth: number = 0;
        let result: string = "";
        for (const char of text) {
            if (char === '{') {
                depth++;
            } else if (char === '}') {
                if (depth > 0) depth--;
            } else if (depth === 0) {
                result += char;
            }
        }
        return result;
    }
}
