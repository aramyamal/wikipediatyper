import { Component, input } from '@angular/core';

@Component({
  selector: 'app-error',
  imports: [],
  templateUrl: './error.html',
  styleUrl: './error.css'
})
export class ErrorComponent {
  errorMessage = input.required<string>();
}
