import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { GameStateService } from '../../services/game-state.service';
import { MathComponent } from '../math/math.component';
import { ArticleWord } from '../../models/article.model';

@Component({
  selector: 'app-word',
  imports: [MathComponent],
  templateUrl: './word.component.html',
  styleUrl: './word.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WordComponent {
  word = input.required<ArticleWord>();
  sIndex = input.required<number>();
  wIndex = input.required<number>();
  segmentBodyLength = input.required<number>();
  baseWordClass = input("word");

  gameState = inject(GameStateService);
}
