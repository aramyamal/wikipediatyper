import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  media = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    document.documentElement.setAttribute(
      "data-bs-theme",
      this.media.matches ? "dark" : "light",
    );

    this.media.addEventListener("change", (event) => {
      document.documentElement.setAttribute(
        "data-bs-theme",
        event.matches ? "dark" : "light",
      );
    })
  }
}
