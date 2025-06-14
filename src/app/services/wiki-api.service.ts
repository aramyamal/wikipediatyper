import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WikiResponse } from '../models/wiki-api.model';

@Injectable({
  providedIn: 'root'
})
export class WikiApiService {
  private http = inject(HttpClient);

  searchWikipedia(lang: string, query: string): Observable<WikiResponse> {
    return this.http.get<WikiResponse>(
      `https://${lang}.wikipedia.org/w/api.php`,
      {
        params: {
          action: 'query',
          list: 'search',
          format: 'json',
          origin: '*',
          srsearch: query ? String(query) : '',
        },
      }
    );
  }
}
