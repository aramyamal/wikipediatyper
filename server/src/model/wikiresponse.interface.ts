export interface WikiResponse {
    batchcomplete: boolean;
    query: {
        pages: {
            pageid: number,
            ns: number,
            title: string;
            extract?: string;
            missing?: boolean;
        }[];
    };
}
