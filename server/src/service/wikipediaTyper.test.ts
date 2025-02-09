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
})
