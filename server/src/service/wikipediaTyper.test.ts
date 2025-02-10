import { Article } from "../model/article.interface";
import { WikiArticle } from "../model/wiki_article.interface";
import { WikipediaTyperService } from "./wikipediaTyper";
import axios from "axios";
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("WikipediaTyperService", () => {
    let service: WikipediaTyperService;
    beforeEach(() => {
        service = new WikipediaTyperService();
    })

    describe("getWikiApi", () => {
        test(
            "should return valid Wikipedia API URL when given a language code",
            async () => {
                const language = "en";
                const result = service["getWikiApi"](language);
                expect(result).toBe("https://en.wikipedia.org/w/api.php");
            }
        )
    })

    describe("scrape", () => {
        test(
            "should throw error when no URL is provided",
            async () => {
                await expect(service.scrape("")).rejects.toThrow();
            }
        )

        test(
            "should throw error when too long language code in URL is given",
            async () => {
                await expect(service.scrape("enen.wikipedia.org/wiki/TestTest"))
                    .rejects
                    .toThrow("Incorrect URL format");
            }
        )

        test(
            "should throw error when no language code in URL is given",
            async () => {
                await expect(service.scrape("wikipedia.org/wiki/TestTest"))
                    .rejects
                    .toThrow("Incorrect URL format");
            }
        )

        test(
            "should return the article when a valid URL is provided",
            async () => {
                const article: WikiArticle = {
                    pageid: 123,
                    ns: 0,
                    title: "ArticleTitle",
                    extract: "This is the article text."
                };

                mockedAxios.get.mockResolvedValueOnce({
                    data: {
                        query: { pages: [article] }
                    }
                });

                const url: string = "en.wikipedia.org/wiki/ArticleTitle";
                const result: WikiArticle = await service.scrape(url);
                expect(result).toEqual(article);

                expect(mockedAxios.get).toHaveBeenCalledWith(
                    "https://en.wikipedia.org/w/api.php",
                    {
                        params: {
                            action: "query",
                            prop: "extracts",
                            exlimit: 1,
                            titles: "ArticleTitle",
                            explaintext: 1,
                            format: "json",
                            formatversion: 2
                        },
                        headers: {
                            "User-Agent": expect
                                .stringContaining("wikipediatyper/1.0")
                        }
                    }
                )
            }
        )
    })
    describe("prettify", () => {
        test("should parse headers", async () => {
            const wikiArticle: WikiArticle = {
                pageid: 0,
                ns: 0,
                title: "Test Title",
                extract:
                    "This is some text.\n\n\n" +
                    "== This is a header 2 ==\n" +
                    "And this is some more text. It continues here.\n\n\n" +
                    "== This is header 2 again ==\n\n\n" +
                    "=== This is header 3 ===\n\n" +
                    "And this is the text under header 3.\n" +
                    "==== This is header4 ====\n" +
                    "And this is the text under header 4.\n" +
                    "This is a new paragraph under header 4 and end of article."
            };

            const prettified: Article = {
                title: "Test Title",
                segments: [
                    {
                        type: "text",
                        body: "This is some text."
                    },
                    {
                        type: "header2",
                        body: "This is a header 2"
                    },
                    {
                        type: "text",
                        body: "And this is some more text. It continues here."
                    },
                    {
                        type: "header2",
                        body: "This is header 2 again"
                    },
                    {
                        type: "header3",
                        body: "This is header 3"
                    },
                    {
                        type: "text",
                        body: "And this is the text under header 3."
                    },
                    {
                        type: "header4",
                        body: "This is header4"
                    },
                    {
                        type: "text",
                        body: "And this is the text under header 4."
                    },
                    {
                        type: "text",
                        body: "This is a new paragraph under header 4 " +
                            "and end of article."
                    }
                ]
            };
            expect(await service.prettify(wikiArticle)).toEqual(prettified);
        });
        test("should remove equation blocks", async () => {
            const wikiArticle: WikiArticle = {
                pageid: 0,
                ns: 0,
                title: "Equation Test",
                extract: "Start with {\displaystyle basic} simple equation. " +
                    "Then {\textstyle inline} version. " +
                    "Nested example: {\displaystyle outer{\textstyle inner}content}. " +
                    "Deep nesting: {\textstyle a{b{c{d}}}}. " +
                    "Mixed {\displaystyle styles{\textstyle with}nesting}. " +
                    "End with {\textstyle final} example."
            };

            const expected: Article = {
                title: "Equation Test",
                segments: [{
                    type: "text",
                    body: "Start with  simple equation. " +
                        "Then  version. " +
                        "Nested example: . " +
                        "Deep nesting: . " +
                        "Mixed . " +
                        "End with  example."
                }]
            };

            expect(await service.prettify(wikiArticle)).toEqual(expected);

        })
    });

})
