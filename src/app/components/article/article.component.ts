import { Component, inject, input } from '@angular/core';
import { WikiApiService } from '../../services/wiki-api.service';

@Component({
  selector: 'app-article.component',
  imports: [],
  templateUrl: './article.component.html',
  styleUrl: './article.component.css'
})
export class ArticleComponent {
  articleUrl = input.required<string>();
  wikiApi = inject(WikiApiService);
}
