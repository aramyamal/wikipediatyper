import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Article } from '../models/article.model';
import { UserArticle } from '../models/user-input.model';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  articleTitle = signal<string>("");
  searchTerm = new FormControl("");
  article = signal<Article>({} as Article);

  currentSegmentIndex = signal<number>(0);
  currentWordIndex = signal<number>(0);
  currentCharIndex = signal<number>(0);
  userInput = new FormControl("");

  userArticle: WritableSignal<UserArticle> = signal([[]]);

  reset() {
    this.userArticle.set([[]]);
    this.currentSegmentIndex.set(0);
    this.currentWordIndex.set(0);
    this.currentCharIndex.set(0);
    this.userInput.setValue("");
  }

  isCorrectLetter(segmentIdx: number, wordIdx: number, charIdx: number): boolean | undefined {
    const currentSegment = this.currentSegmentIndex();
    if (segmentIdx > currentSegment) {
      return undefined;
    }

    const currentWord = this.currentWordIndex();
    if (segmentIdx === currentSegment && wordIdx > currentWord) {
      return undefined;
    }

    const currentChar = this.currentCharIndex()
    if (
      segmentIdx === currentSegment &&
      wordIdx === currentWord &&
      charIdx > currentChar
    ) {
      return undefined;
    }

    const word = this.article().segments[segmentIdx]?.body[wordIdx];
    if (word.math) {
      // math words are correct if current position is at or past them
      if (segmentIdx < currentSegment ||
        (segmentIdx === currentSegment && wordIdx < currentWord)
      ) {
        return true;
      }
      return undefined; // still a future math word
    } else {
      const quanta = word.word?.at(charIdx);
      if (quanta?.anyKey) {
        return true;
      } else {
        if (
          segmentIdx < currentSegment ||
          (segmentIdx === currentSegment && wordIdx < this.currentWordIndex())
        ) {
          return this.userArticle()[segmentIdx]?.[wordIdx]?.[charIdx] === quanta?.value;
        }
        const currentWordInput = this.userInput.value ?? "";

        if (charIdx >= currentWordInput.length) {
          return undefined;
        }
        return quanta?.value === currentWordInput[charIdx];
      }
    }
  }

  getExcess(segmentIdx: number, wordIdx: number): Signal<string> {
    return computed(() => {
      const targetWordObject = this.article().segments[segmentIdx]?.body[wordIdx];

      if (!targetWordObject || !targetWordObject.word) {
        return "";
      }

      const targetWordLength = targetWordObject.word.length;

      let wordToCheck: string;

      const currentSegment = this.currentSegmentIndex();
      const currentWord = this.currentWordIndex();

      if (segmentIdx === currentSegment && wordIdx === currentWord) {
        wordToCheck = this.userInput.value ?? "";
      } else if (
        segmentIdx < currentSegment ||
        (segmentIdx === currentSegment && wordIdx < currentWord)
      ) {
        // for words that have already been completed and stored in userArticle
        wordToCheck = this.userArticle()[segmentIdx]?.[wordIdx] ?? "";
      } else {
        // for future words there is no excess
        return "";
      }

      // check for excess based on the determined 'wordToCheck'
      if (wordToCheck.length > targetWordLength) {
        return wordToCheck.substring(targetWordLength);
      } else {
        return "";
      }
    });
  }

  onKeyDown(event: KeyboardEvent) {
    const currentWordValue = this.userInput.value ?? "";

    // handle spaces
    if (event.key === " ") {
      // prevent adding empty words
      if (currentWordValue.trim().length > 0) {
        const currentSegIdx = this.currentSegmentIndex();
        const currentWordIdx = this.currentWordIndex();

        this.userArticle.update(prevUserArticle => {
          const newUserArticle = [...prevUserArticle];
          // ensure segment array exists and copy it
          newUserArticle[currentSegIdx] = [...(newUserArticle[currentSegIdx] || [])];
          // place the completed word at its correct index
          newUserArticle[currentSegIdx][currentWordIdx] = currentWordValue.trim();
          return newUserArticle;
        });

        this.currentWordIndex.set(this.currentWordIndex() + 1); // move to the next word
        this.currentCharIndex.set(0); // reset char index for the new word
        this.userInput.setValue("");
        event.preventDefault();
      } else {
        event.preventDefault();
      }
    } else if (event.key === "Enter") {
      // complete current word and move to next segment
      const currentSegIdx = this.currentSegmentIndex();
      const currentWordIdx = this.currentWordIndex();

      this.userArticle.update(prevUserArticle => {
        const newUserArticle = [...prevUserArticle];
        newUserArticle[currentSegIdx] = [...(newUserArticle[currentSegIdx] || [])];
        newUserArticle[currentSegIdx][currentWordIdx] = currentWordValue.trim();

        // prepare for the next segment: add a new empty segment array
        newUserArticle.push([]);
        return newUserArticle;
      });

      this.currentSegmentIndex.set(this.currentSegmentIndex() + 1);
      this.currentWordIndex.set(0);
      this.currentCharIndex.set(0);
      this.userInput.setValue("");
      event.preventDefault(); // prevent default enter key behavior

    } else if (event.key === "Backspace") {
      if (event.ctrlKey) {
        // handle ctrl + backspace (delete current word)
        this.userInput.setValue("");
        this.currentCharIndex.set(0);
        event.preventDefault();
      } else {
        // handle standard backspace (delete last character)
        this.currentCharIndex.set(Math.max(0, currentWordValue.length - 1));
      }
    } else {
      if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey &&
        !event.key.startsWith('Arrow') &&
        event.key !== 'Tab'
      ) {
        this.currentCharIndex.set(currentWordValue.length + 1);
      }
    }
  }

  isCursorPos(segmentIdx: number, wordIdx: number, charIdx: number): Signal<boolean> {
    return computed(() => {
      const currentSegment = this.currentSegmentIndex();
      const currentWord = this.currentWordIndex();
      const currentChar = this.currentCharIndex();

      if (!(currentSegment === segmentIdx && currentWord === wordIdx)) {
        return false;
      }
      return currentChar === charIdx;
    });
  }

  isSpaceCursorPos(segmentIdx: number, wordIdx: number): Signal<boolean> {
    return computed(() => {
      const currentSegment = this.currentSegmentIndex();
      const currentWord = this.currentWordIndex();
      const currentChar = this.currentCharIndex();

      const targetWordLength = this.getWordLength(segmentIdx, wordIdx);

      return (
        currentSegment === segmentIdx &&
        currentWord === wordIdx &&
        currentChar === targetWordLength
      );
    });
  }

  getWordLength(segmentIdx: number, wordIdx: number): number {
    const segment = this.article().segments[segmentIdx];
    const word = segment?.body[wordIdx];

    if (word?.word) {
      return word.word.length;
    }
    return (word?.math) ? 1 : 0;
  }
  // TODO add stats like wpm etc here
}
