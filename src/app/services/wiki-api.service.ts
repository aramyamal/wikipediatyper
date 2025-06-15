import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  WikiArticleResponse,
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
}
