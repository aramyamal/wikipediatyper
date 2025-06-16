import { Routes, UrlSegment } from '@angular/router';
import { ArticleComponent } from './components/article/article.component';
import {
  RandomRedirectComponent
} from './components/random-redirect/random-redirect.component';

export const routes: Routes = [
  { path: "", component: RandomRedirectComponent },
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
