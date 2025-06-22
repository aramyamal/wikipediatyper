import { Injectable, signal } from '@angular/core';
import { FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  articleTitle = signal<string>("");
  searchTerm = new FormControl("");
  // TODO add stats like wpm etc here
}
