export interface ArticleSegment {
  type: `header${number}` | "text" | "math",
  body: string
}

export interface Article {
  title: string,
  segments: ArticleSegment[]
}
