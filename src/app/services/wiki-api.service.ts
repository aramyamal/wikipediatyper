import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  WikiArticleResponse,
  WikiRandomResponse,
  WikiSearchResponse
} from '../models/wiki-api.model';

@Injectable({
  providedIn: 'root'
})
export class WikiApiService {
  private http = inject(HttpClient);

  public validateUrl(url: string): boolean {
    const regex = /^([A-Za-z]{2,3})\.wikipedia\.org\/wiki\/.+$/i;
    return regex.test(url)
  }

  private getApi(lang: string): string {
    return `https://${lang}.wikipedia.org/w/api.php`;
  }

  search(lang: string, query: string): Observable<WikiSearchResponse> {
    return this.http.get<WikiSearchResponse>(
      this.getApi(lang),
      {
        params: {
          action: 'query',
          list: 'search',
          format: 'json',
          origin: '*',
          srsearch: query ? String(query) : '',
        },
      }
    )
  }

  getArticle(lang: string, title: string): Observable<WikiArticleResponse> {
    return this.http.get<WikiArticleResponse>(
      this.getApi(lang),
      {
        params: {
          action: "query",
          prop: "extracts",
          exlimit: 1,
          titles: title,
          explaintext: 1,
          format: "json",
          origin: '*',
          formatversion: 2
        },
      })
  }

  getRandomArticleUrl(lang: string): Observable<string> {
    return this.http
      .get<WikiRandomResponse>(
        this.getApi(lang),
        {
          params: {
            action: "query",
            list: "random",
            format: "json",
            origin: "*",
            rnnamespace: "0",
            rnlimit: "1",
          }
        })
      .pipe(
        map((response) => {
          const randomPage = response.query.random[0];
          const encodedTitle = this.urlEncodeTitle(randomPage.title);
          return `${lang}.wikipedia.org/wiki/${encodedTitle}`;
        }),
      );
  }

  urlEncodeTitle(title: string): string {
    const encodedTitle = encodeURIComponent(title);
    return encodedTitle
      .replace(/\(/g, '%28') // Replace ( with %28
      .replace(/\)/g, '%29'); // Replace ) with %29
  }
}
