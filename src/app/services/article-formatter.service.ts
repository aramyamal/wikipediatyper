import { Injectable } from '@angular/core';
import { WikiArticleResponse } from '../models/wiki-api.model';
import { Article, ArticleLatex, ArticleQuanta, ArticleSegment, ArticleWord } from '../models/article.model';

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
      .replace(/–/g, "-")
      // replce prime symbol with '
      .replace(/′/g, "'")
      .replace(/″/g, "''")
      .replace(/‴/g, "'''")
      .replace(/⁗/g, "''''");

    // lastly, remove empty sections
  }

  private cleanCurlyBraces(text: string): string {
    return text;
  }

  private truncate(text: string): string {
    //TODO: add removal of these sections for other languages as well
    const endSectionRegex =
      /^==\s*(?:Notes|References|See also|External links|Selected Publications|Bibliography|Discography)\s*==/im;
    const parts = text.split(endSectionRegex);
    return parts[0].trim();
  }

  private quantize(body: string): ArticleWord[] {
    body = body.trim();

    // if math, return immediately
    if (body.startsWith("{\\")) {
      const isBlock = body.endsWith(",}")
        || body.endsWith(".}")
        || body.includes("matrix");
      return [{ math: { latex: body, isBlock: isBlock } }];
    }

    const words: ArticleWord[] = [];
    let quantas: ArticleQuanta[] = [];
    for (const char of body) {

      // spaces
      if (char === " ") {
        words.push({ word: quantas });
        quantas = [];
      } else { // normal characters
        // add anyKey handling here
        quantas.push({ value: char, anyKey: false });
      }
    }
    if (quantas.length) {
      words.push({ word: quantas });
    }
    return words;
  }

  format(response: WikiArticleResponse): Article {
    let inlineNextText = false;
    let prevInlineMathRef: ArticleLatex | undefined = undefined;

    const page = response.query.pages[0];

    if (page.missing || !page.extract) {
      throw new Error("Parsing empty article not allowed");
    }

    const full = page.extract;
    const truncated = this.truncate(full);

    const rawSegments: string[] = truncated.split("\n")
      .filter(segment => segment.trim().length > 0);

    const articleSegments: ArticleSegment[] = [];

    for (const rawSegment of rawSegments) {
      // match headers like "== header2 ==", and "=== header3 ===" etc
      const headerMatch: RegExpMatchArray | null = rawSegment
        .match(/^(=+)\s*(.+?)\s*\1$/);

      if (headerMatch) {
        const level: number = headerMatch[1].length;
        const body: string = headerMatch[2].trim();

        inlineNextText = false;
        articleSegments.push({
          type: `header${level}`,
          body: this.quantize(body)
        });
      } else {
        if (!rawSegment.trim().includes(" ")) {
          continue;
        }
        const quantized = this.quantize(this.cleanText(rawSegment));

        // single‐item special for math
        if (quantized.length === 1 && quantized[0].math) {
          const mathQ = quantized[0];
          if (mathQ.math?.isBlock) {
            // a standalone block equation
            articleSegments.push({ type: "math", body: [mathQ] });
            inlineNextText = false;
          } else {
            // inline math: stick it onto the previous segment
            articleSegments[articleSegments.length - 1].body.push(mathQ);
            prevInlineMathRef = mathQ.math;
            inlineNextText = true;
          }
        } else {
          // normal text
          if (inlineNextText) {
            const previousSegment = articleSegments[articleSegments.length - 1];
            previousSegment.body.push(...quantized);

            // dont render space after inline math if it is followed by a comma
            const firstCharOfSegm = quantized.at(0)?.word?.at(0)?.value;
            if (firstCharOfSegm === "."
              || firstCharOfSegm === ","
              || firstCharOfSegm === "?") {
              if (prevInlineMathRef) {
                prevInlineMathRef.noSpace = true;
              }
            }
            inlineNextText = false;
          } else {
            articleSegments.push({
              type: "text",
              body: quantized
            });
          }
        }
      }
    }
    return {
      title: page.title,
      segments: articleSegments
    };
  }
}
