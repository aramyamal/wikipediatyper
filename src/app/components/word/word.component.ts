import { Component, computed, inject, input } from '@angular/core';
import { GameStateService } from '../../services/game-state.service';
import { MathComponent } from '../math/math.component';
import { ArticleWord } from '../../models/article.model';

@Component({
  selector: 'app-word',
  imports: [MathComponent],
  templateUrl: './word.component.html',
  styleUrl: './word.component.css',
})
export class WordComponent {
  word = input.required<ArticleWord>();
  sIndex = input.required<number>();
  wIndex = input.required<number>();
  segmentBodyLength = input.required<number>();
  baseWordClass = input("word");

  gameState = inject(GameStateService);

  readonly wordData = computed(() => {
    const w = this.word();
    const sIdx = this.sIndex();
    const wIdx = this.wIndex();
    const currentSegment = this.gameState.currentSegmentIndex();
    const currentWord = this.gameState.currentWordIndex();

    // Only track user input for the current word
    const isCurrentWord = sIdx === currentSegment && wIdx === currentWord;
    if (isCurrentWord) {
      // This makes only the current word reactive to typing
      this.gameState.userInputSignal();
    }

    return {
      word: w,
      sIndex: sIdx,
      wIndex: wIdx,
      excess: this.gameState.getExcess(sIdx, wIdx),
      isLastWord: wIdx === this.segmentBodyLength() - 1,
      segmentPassed: currentSegment > sIdx,
      mathCorrect: w.math ? this.gameState.isCorrectLetter(sIdx, wIdx, 0) : false
    };
  });
}
