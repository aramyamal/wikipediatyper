import { Component, effect, ElementRef, input, viewChild } from '@angular/core';
import katex from 'katex';

@Component({
  selector: 'app-math',
  imports: [],
  templateUrl: './math.component.html',
  styleUrl: './math.component.css'
})
export class MathComponent {
  latex = input.required<string>();
  mathElement = viewChild<ElementRef>("math");

  constructor() {
    effect(() => {
      const mathElement = this.mathElement();
      if (mathElement) {
        katex.render(this.latex(), mathElement.nativeElement, {
          throwOnError: false,
          displayMode: true
        });
      }
    });
  }
}
