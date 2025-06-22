import { Injectable, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Article } from '../models/article.model';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  articleTitle = signal<string>("");
  searchTerm = new FormControl("");
  article = signal<Article>({} as Article);

  // TODO add stats like wpm etc here
}
