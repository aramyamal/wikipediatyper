import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Article } from '../models/article.model';
import { UserArticle } from '../models/user-input.model';
import { CursorPosition } from '../models/cursor-position';
import { toSignal } from '@angular/core/rxjs-interop';

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
  userInputSignal = toSignal(this.userInput.valueChanges, { initialValue: "" });

  userArticle: WritableSignal<UserArticle> = signal([[]]);

  modalIsOpen = signal(false);

  currentPosition = computed<CursorPosition>(() => ({
    sIndex: this.currentSegmentIndex(),
    wIndex: this.currentWordIndex(),
    qIndex: this.currentCharIndex()
  }));

  reset() {
    this.userArticle.set([[]]);
    this.currentSegmentIndex.set(0);
    this.currentWordIndex.set(0);
    this.currentCharIndex.set(0);
    this.userInput.setValue("");
  }

  getCurrentLetterElementId(): string | null {
    const article = this.article();
    if (!article || !article.segments || article.segments.length === 0) {
      return null;
    }

    const pos = this.currentPosition();
    const currentSegment = this.article().segments[pos.sIndex];
    const currentWord = currentSegment?.body[pos.wIndex];

    if (!currentWord || !currentWord.word) {
      return null;
    }

    // if we're at or past the end of the word, use the last character
    const maxCharIndex = currentWord.word.length - 1;
    const actualCharIndex = Math.min(pos.qIndex, maxCharIndex);

    return `q-${pos.sIndex}-${pos.wIndex}-${actualCharIndex}`;
  }

  private isWordCorrect(segmentIdx: number, wordIdx: number): boolean {
    const targetWordObject = this.article().segments[segmentIdx]?.body[wordIdx];
    const userTypedWord = this.userArticle()[segmentIdx]?.[wordIdx] || '';

    if (!targetWordObject || !targetWordObject.word) {
      return false;
    }

    if (targetWordObject.math) {
      return true;
    }

    if (targetWordObject.word.length < userTypedWord.length) {
      return false;
    }

    for (const [index, quanta] of targetWordObject.word.entries()) {
      if (!quanta.anyKey && quanta.value != userTypedWord[index]) {
        return false;
      }
    }

    return true;
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

  getExcess(segmentIdx: number, wordIdx: number): string {
    const targetWordObject = this.article().segments[segmentIdx]?.body[wordIdx];

    if (!targetWordObject?.word) {
      return "";
    }

    const targetWordLength = targetWordObject.word.length;
    const currentSegment = this.currentSegmentIndex();
    const currentWord = this.currentWordIndex();

    let wordToCheck: string;

    if (segmentIdx === currentSegment && wordIdx === currentWord) {
      wordToCheck = this.userInput.value ?? "";
    } else if (
      segmentIdx < currentSegment ||
      (segmentIdx === currentSegment && wordIdx < currentWord)
    ) {
      wordToCheck = this.userArticle()[segmentIdx]?.[wordIdx] ?? "";
    } else {
      return "";
    }

    return wordToCheck.length > targetWordLength
      ? wordToCheck.substring(targetWordLength)
      : "";
  }

  getExcessCharCount(sIndex: number, wIndex: number): number {
    const pos = this.currentPosition();
    if (pos.sIndex !== sIndex || pos.wIndex !== wIndex) {
      return 0;
    }

    const currentSegment = this.article().segments[sIndex];
    const currentWord = currentSegment?.body[wIndex];

    if (!currentWord || !currentWord.word) {
      return 0;
    }

    return Math.max(0, pos.qIndex - currentWord.word.length);
  }

  onKeyDown(event: KeyboardEvent) {
    const currentWordValue = this.userInput.value ?? "";
    const currentSegIdx = this.currentSegmentIndex();
    const currentWordIdx = this.currentWordIndex();

    if (event.key === "Backspace" && (event.ctrlKey || event.metaKey)) {
      // if nothing on current input and previous word had an error
      if (currentWordValue.length === 0
        && currentWordIdx != 0
        && !this.isWordCorrect(currentSegIdx, currentWordIdx - 1)
      ) {
        // delete current empty word and go back to previous
        event.preventDefault();
        this.currentWordIndex.update(prevIndex => prevIndex - 1);
        const wordFromUserArticle = this.userArticle()
          .at(currentSegIdx)?.at(currentWordIdx - 1) || '';
        this.userInput.setValue(wordFromUserArticle);
        this.currentCharIndex.set(wordFromUserArticle.length);
      }
      event.preventDefault();
      this.userInput.setValue("");
      this.currentCharIndex.set(0);
      return; // Exit early
    }

    // handle spaces
    if (event.key === " ") {
      // prevent adding empty words
      if (currentWordValue.trim().length > 0) {
        this.userArticle.update(prevUserArticle => {
          const newUserArticle = [...prevUserArticle];
          // ensure segment array exists and copy it
          newUserArticle[currentSegIdx] = [...(newUserArticle[currentSegIdx] || [])];
          // place the completed word at its correct index
          newUserArticle[currentSegIdx][currentWordIdx] = currentWordValue.trim();
          return newUserArticle;
        });

        this.currentWordIndex.set(currentWordIdx + 1); // move to the next word
        this.currentCharIndex.set(0); // reset char index for the new word
        this.userInput.setValue("");
        event.preventDefault();
      } else {
        event.preventDefault();
      }
    } else if (event.key === "Enter") {
      // complete current word and move to next segment
      this.userArticle.update(prevUserArticle => {
        prevUserArticle[currentSegIdx] = [...(prevUserArticle[currentSegIdx] || [])];
        prevUserArticle[currentSegIdx][currentWordIdx] = currentWordValue.trim();

        // prepare for the next segment: add a new empty segment array
        prevUserArticle.push([]);
        return prevUserArticle;
      });

      this.currentSegmentIndex.set(currentSegIdx + 1);
      this.currentWordIndex.set(0);
      this.currentCharIndex.set(0);
      this.userInput.setValue("");
      event.preventDefault(); // prevent default enter key behavior

    } else if (event.key === "Backspace") {
      // if nothing on current input and previous word had an error
      if (currentWordValue.length === 0
        && currentWordIdx != 0
        && !this.isWordCorrect(currentSegIdx, currentWordIdx - 1)
      ) {
        // delete current empty word and go back to previous
        event.preventDefault();
        this.currentWordIndex.update(prevIndex => prevIndex - 1);
        const wordFromUserArticle = this.userArticle()
          .at(currentSegIdx)?.at(currentWordIdx - 1) || '';
        this.userInput.setValue(wordFromUserArticle);
        this.currentCharIndex.set(wordFromUserArticle.length);
      }
      else {
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
  // TODO add stats like wpm etc here
}
