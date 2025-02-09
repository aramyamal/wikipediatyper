export interface WikiArticle {
    pageid: number,
    ns: number,
    title: string;
    extract?: string;
    missing?: boolean;
}
