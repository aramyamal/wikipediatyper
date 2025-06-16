import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  articleTitle = signal<string>("");
  // TODO add stats like wpm etc here
}
