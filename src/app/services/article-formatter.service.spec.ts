import { TestBed } from '@angular/core/testing';

import { ArticleFormatterService } from './article-formatter.service';

describe('ArticleFormatterService', () => {
  let service: ArticleFormatterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArticleFormatterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
