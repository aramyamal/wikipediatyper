import { Component, inject } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { ThemeService } from './services/theme.service';
// import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  // imports: [RouterOutlet],
  imports: [HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private themeService = inject(ThemeService);
}
