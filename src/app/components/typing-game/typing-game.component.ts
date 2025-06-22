import { Component, inject } from '@angular/core';
import { GameStateService } from '../../services/game-state.service';
import { MathComponent } from '../math/math.component';

@Component({
  selector: 'app-typing-game',
  imports: [MathComponent],
  templateUrl: './typing-game.component.html',
  styleUrl: './typing-game.component.css'
})
export class TypingGameComponent {
  protected gameState = inject(GameStateService);
}
