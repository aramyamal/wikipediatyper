export interface ArticleQuanta { value: string; anyKey?: boolean }

export interface ArticleWord {
  word?: ArticleQuanta[],
  math?: ArticleLatex
}

export interface ArticleLatex {
  latex: string,
  isBlock: boolean,
  noSpace?: boolean
}

export interface ArticleSegment {
  type: `header${number}` | "text" | "math",
  body: ArticleWord[]
}

export interface Article {
  title: string,
  segments: ArticleSegment[]
}
