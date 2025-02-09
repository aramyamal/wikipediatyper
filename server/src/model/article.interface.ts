import { ArticleSegment } from "./article_segment.interface";

export interface Article {
    title: string,
    segments: ArticleSegment[]
}
