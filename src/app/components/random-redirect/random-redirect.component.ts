import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { WikiApiService } from '../../services/wiki-api.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-random-redirect.component',
  imports: [],
  templateUrl: './random-redirect.component.html',
  styleUrl: './random-redirect.component.css'
})
export class RandomRedirectComponent {
  router = inject(Router);
  wikiApi = inject(WikiApiService);

  constructor() {
    this.wikiApi.getRandomArticleUrl("en").pipe(
      map(url => this.router.navigateByUrl("/" + url))
    ).subscribe()
  }
}
