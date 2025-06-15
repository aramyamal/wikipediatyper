import { Component, inject, input, signal, effect } from '@angular/core';
import { WikiApiService } from '../../services/wiki-api.service';
import { ErrorComponent } from '../error/error';
import { WikiArticleResponse } from '../../models/wiki-api.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-article.component',
  imports: [ErrorComponent],
  templateUrl: './article.component.html',
  styleUrl: './article.component.css'
})
export class ArticleComponent {
  articleUrl = input.required<string>();
  wikiApi = inject(WikiApiService);

  errorMessage = signal<string>("");
  articleTest = signal<string>("");

  constructor() {
    effect(() => {
      const url = this.articleUrl();
      this.errorMessage.set("");
      this.loadArticle(url);
    })
  }

  private loadArticle(url: string): void {
    const errorMessage = "Incorrect Wikipedia URL. Try using the search " +
      "feature to find the article you're looking for." // 400 error code

    if (!this.wikiApi.validateUrl(url)) {
      this.errorMessage.set(errorMessage)
      return;
    }

    const language: string | undefined = url.split(".")[0];
    if (!language) {
      this.errorMessage.set(errorMessage)
      return;
    }
    if (language.length > 3) {
      this.errorMessage.set(errorMessage)
      return;
    }

    const title: string | undefined = url.match(/\/wiki\/([^#?]+)/)?.[1];
    if (!title) {
      this.errorMessage.set(errorMessage)
      return;
    }

    this.wikiApi
      .getArticle(language, title)
      .subscribe({
        next: (response: WikiArticleResponse) => {
          if (response.query.pages[0].missing == true) {
            this.errorMessage.set(
              `Article '${title}' with language code ${language} does not ` +
              "exist on Wikipedia.");
          }
          // push the loaded content into articleTest
          this.articleTest.set(JSON.stringify(response));
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage.set(err.message);
        },
      });
  }
}
