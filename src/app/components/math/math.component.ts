import { ChangeDetectionStrategy, Component, effect, ElementRef, input, viewChild } from '@angular/core';
import katex from 'katex';

@Component({
  selector: 'app-math',
  imports: [],
  templateUrl: './math.component.html',
  styleUrl: './math.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MathComponent {
  latex = input.required<string | undefined>();
  inline = input(false);
  mathElement = viewChild<ElementRef>("math");

  constructor() {
    effect(() => {
      const mathElement = this.mathElement();
      const latex = this.latex();
      if (mathElement && latex) {
        katex.render(latex, mathElement.nativeElement, {
          throwOnError: false,
          displayMode: !this.inline
        });
      }
    });
  }
}
