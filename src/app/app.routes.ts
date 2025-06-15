import { Routes, UrlSegment } from '@angular/router';
import { ArticleComponent } from './components/article/article.component';
import { ErrorComponent } from './components/error/error';

function validateUrl(url: string): boolean {
  const regex = /^([a-z]{2,3})\.wikipedia\.org\/wiki\/[A-Za-z0-9_]+$/;
  return regex.test(url)
}

export const routes: Routes = [
  {
    matcher: (url: UrlSegment[]) => {
      if (url.length === 0) {
        return null;
      }

      const fullPath = url.map(s => s.path).join("/");
      if (validateUrl(fullPath)) {
        return null;
      }

      return {
        consumed: url,
      };
    },
    component: ErrorComponent,
    data: { errorMessage: "Incorrect Wikipedia URL. Try using the search feature to find the article you're looking for." },
  },
  {
    matcher: (url: UrlSegment[]) => {
      if (url.length === 0) {
        return null;
      }

      const fullPath = url.map(s => s.path).join("/");

      return {
        consumed: url,
        posParams: {
          articleUrl: new UrlSegment(fullPath, {})
        }
      };
    },
    component: ArticleComponent,
  },
];
