import { Component, HostListener, inject, viewChild } from '@angular/core';
import { SearchModalComponent } from '../search-modal/search-modal.component';
import { GameStateService } from '../../services/game-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [SearchModalComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  protected gameState = inject(GameStateService);
  private router = inject(Router);

  searchModalComponent = viewChild(SearchModalComponent);

  onSearchClick() {
    const component = this.searchModalComponent();
    if (component) {
      component.show();
    }
  }
  onShuffleClick() {
    this.router.navigateByUrl("/");
  }

  openGithub() {
    window.open('https://github.com/aramyamal/wikipediatyper', '_blank', 'noopener');
  }

  openSponsor() {
    window.open('https://buymeacoffee.com/aramyamal', '_blank', 'noopener');
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // check for ctrl + k (windows/linux) or cmd + k (macOS)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault(); // Prevent default browser behavior (e.g., opening search in Chrome)
      this.onSearchClick(); // Open your search modal
    }
  }
}
