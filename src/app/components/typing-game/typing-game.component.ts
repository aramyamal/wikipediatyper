import { Component, ElementRef, inject, viewChild, signal, effect } from '@angular/core';
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
  userInputField = viewChild<ElementRef>("userInputField");
  cursor = viewChild<ElementRef>("cursor");
  cursorPosition = signal({ x: 0, y: 0, isHeader: false });
  inputFocused = false;

  private elementCache = new Map<string, HTMLElement>();

  constructor() {
    effect(() => {
      this.focus();
    });

    effect(() => {
      if (!this.gameState.modalIsOpen()) {
        setTimeout(() => this.focus(), 150);
      }
    });

    // clear cache when article changes
    effect(() => {
      this.gameState.article();
      this.elementCache.clear();
    });
  }

  onInputFocus() {
    this.inputFocused = true;
  }
  onInputBlur() {
    setTimeout(() => this.inputFocused = false, 0);
  }

  focus() {
    const input = this.userInputField()?.nativeElement;
    if (input) {
      input.focus({ preventScroll: true });
    }
    this.updateCursorPosition();
  }

  private updateCursorPosition() {
    const elementId = this.gameState.getCurrentLetterElementId();
    if (!elementId) return;

    let targetElement: HTMLElement | null | undefined =
      this.elementCache.get(elementId);
    if (!targetElement) {
      targetElement = document.getElementById(elementId);
      if (targetElement) {
        this.elementCache.set(elementId, targetElement);
      }
    }

    if (targetElement) {
      targetElement.scrollIntoView({
        block: 'center',
        inline: 'nearest'
      });

      this.positionCursorAtElement(targetElement);
    }
  }

  private positionCursorAtElement(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    const pos = this.gameState.currentPosition();
    const currentSegment = this.gameState.article().segments[pos.sIndex];
    const currentWord = currentSegment?.body[pos.wIndex];

    let xPosition = rect.left + scrollLeft;

    if (currentWord?.word) {
      const wordLength = currentWord.word.length;

      if (pos.qIndex >= wordLength) {
        xPosition = rect.right + scrollLeft;

        const excessCount = pos.qIndex - wordLength;
        if (excessCount > 0) {
          const charWidth = rect.width;
          const excessOffset = charWidth * excessCount;
          xPosition += excessOffset;
        }
      } else if (pos.qIndex > 0) {
        const charWidth = rect.width;
        const charOffset = charWidth * (pos.qIndex - Math.min(pos.qIndex, wordLength - 1));
        xPosition += charOffset;
      }
    }

    const isHeader = currentSegment.type.startsWith("header");

    const newPosition = {
      x: xPosition,
      y: rect.top + scrollTop,
      isHeader
    };

    this.cursorPosition.set(newPosition);
  }

  trackBySegment(index: number, segment: any): any {
    return segment.id || index;
  }
}
