export interface ArticleSegment {
  type: `header${number}` | "text",
  body: string
}

export interface Article {
  title: string,
  segments: ArticleSegment[]
}
