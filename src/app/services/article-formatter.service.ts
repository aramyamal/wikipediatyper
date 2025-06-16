import { Injectable } from '@angular/core';
import { WikiArticleResponse } from '../models/wiki-api.model';
import { Article, ArticleSegment } from '../models/article.model';

@Injectable({
  providedIn: 'root'
})
export class ArticleFormatterService {

  private cleanText(text: string): string {
    return this.cleanCurlyBraces(text)
      // remove residue reference markers
      .replace(/:\s[0-9][0-9]*((\.|-|–)[0-9]*)*\s/g, "")
      // reduce multiple spaces to one
      .replace(/\s{2,}/g, " ")
      // replace all " ." with "."
      .replace(/\s\./g, ".")
      // replace all "–" with "-" for writability
      .replace(/–/g, "-");

    // lastly, remove empty sections
  }

  private cleanCurlyBraces(text: string): string {
    let depth = 0;
    let result = "";
    for (const char of text) {
      if (char === '{') {
        depth++;
      } else if (char === '}') {
        if (depth > 0) depth--;
      } else if (depth === 0) {
        result += char;
      }
    }
    return result;
  }

  private truncate(text: string): string {
    //TODO: add removal of these sections for other languages as well
    const endSectionRegex =
      /^==\s*(?:Notes|References|See also|External links)\s*==/im;
    const parts = text.split(endSectionRegex);
    return parts[0].trim();
  }

  format(response: WikiArticleResponse): Article {
    const page = response.query.pages[0];

    if (page.missing || !page.extract) {
      throw new Error("Parsing empty article not allowed");
    }

    const full = page.extract;
    const truncated = this.truncate(full);

    const rawSegments: string[] = truncated.split("\n")
      .filter(segment => segment.trim().length > 0);

    let articleSegments: ArticleSegment[] = [];

    for (const rawSegment of rawSegments) {
      // match headers like "== header2 ==", and "=== header3 ===" etc
      const headerMatch: RegExpMatchArray | null = rawSegment
        .match(/^(=+)\s*(.+?)\s*\1$/);

      if (headerMatch) {
        const level: number = headerMatch[1].length;
        const body: string = headerMatch[2].trim();

        articleSegments.push({
          type: `header${level}`,
          body: body
        });
      } else {
        articleSegments.push({
          type: "text",
          body: this.cleanText(rawSegment)
        })
      }
    }

    articleSegments = articleSegments.filter((segment, index, allSegments) => {
      if (segment.type === "text") {
        return true;
      }
      const nextSegment = allSegments[index + 1];
      return nextSegment && nextSegment.type === 'text';
    })

    return {
      title: page.title,
      segments: articleSegments
    };
  }
}
