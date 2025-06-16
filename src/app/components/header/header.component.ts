import { Component, inject, signal, viewChild } from '@angular/core';
import { SearchModalComponent } from '../search-modal/search-modal.component';

@Component({
  selector: 'app-header',
  imports: [SearchModalComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  articleName = signal("Article Name Placeholder");

  searchModalComponent = viewChild(SearchModalComponent);

  onSearchClick() {
    const component = this.searchModalComponent();
    if (component) {
      component.show();
    }
  }
  onShuffleClick() { }
}
