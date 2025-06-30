import { Component, inject } from '@angular/core';
import { GameStateService } from '../../services/game-state.service';
import { MathComponent } from '../math/math.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { WordComponent } from '../word/word.component';

@Component({
  selector: 'app-typing-game',
  imports: [MathComponent, ReactiveFormsModule, ScrollingModule, WordComponent],
  templateUrl: './typing-game.component.html',
  styleUrl: './typing-game.component.css'
})
export class TypingGameComponent {
  protected gameState = inject(GameStateService);

  userInput = this.gameState.userInput;

  jsonify(input: Object): string {
    return JSON.stringify(input);
  }
}
