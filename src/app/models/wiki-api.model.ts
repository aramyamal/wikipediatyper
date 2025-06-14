export interface WikiResponse {
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

export function getEmptyWikiResponse(): WikiResponse {
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
