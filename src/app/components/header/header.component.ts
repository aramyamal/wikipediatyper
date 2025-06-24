import { Component, inject, viewChild } from '@angular/core';
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
}
