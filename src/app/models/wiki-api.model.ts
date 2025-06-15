export interface WikiSearchResponse {
  batchcomplete: string;
  continue?: {
    sroffset: number;
    continue: string;
  };
  query: {
    searchinfo: {
      totalhits: number;
    };
    search: WikiResult[];
  };
}

export interface WikiResult {
  ns: number;
  title: string;
  pageid: number;
  size: number;
  wordcount: number;
  snippet: string;
  timestamp: string; // iso8601
}

export function getEmptyWikiResponse(): WikiSearchResponse {
  return {
    batchcomplete: "",
    query: {
      searchinfo: {
        totalhits: 0
      },
      search: []
    }
  };
}

export interface WikiArticleResponse {
  batchcomplete: boolean;
  query: {
    pages: WikiArticle[];
  };
}

export interface WikiArticle {
  pageid: number,
  ns: number,
  title: string;
  extract?: string;
  missing?: boolean;
}

