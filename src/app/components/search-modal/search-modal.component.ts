import {
  Component,
  AfterViewInit,
  viewChild,
  ElementRef,
  signal,
  inject, OnDestroy,
  HostListener
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';
import { LanguageOption } from './language-option.model';
import {
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  of,
  startWith,
  switchMap,
  map,
  finalize,
  Subject,
  fromEvent,
  takeUntil
} from 'rxjs';
import {
  getEmptyWikiResponse,
  WikiSearchResponse,
  WikiResult,
} from '../../models/wiki-api.model';
import { WikiApiService } from '../../services/wiki-api.service';
import { Router } from '@angular/router';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-search-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './search-modal.component.html',
  styleUrl: './search-modal.component.css'
})
export class SearchModalComponent implements AfterViewInit, OnDestroy {
  searchLang = new FormControl("en");
  loading = signal(false);
  results = signal<WikiResult[]>([]);
  placeholderTextOffsets = [2, 6, 4, 5, 3, 5, 1];

  languages: LanguageOption[] = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'sv', label: 'Svenska' },
    { code: 'ar', label: 'العربية' }
  ];

  private gameState = inject(GameStateService);
  protected searchTerm = this.gameState.searchTerm;
  private router = inject(Router);
  private wikiApi = inject(WikiApiService);

  constructor() {

    const search$ = this.searchTerm.valueChanges.pipe(
      startWith(this.searchTerm.value?.trim()), // emit first value right away
      debounceTime(300), // prevent overloading api
      distinctUntilChanged() // only emit if new value is different from old
    );

    const lang$ = this.searchLang.valueChanges.pipe(
      startWith(this.searchLang.value),
      distinctUntilChanged()
    )

    const results$ = combineLatest([search$, lang$]).pipe(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      filter(([query, _]) => { // empty results if query empty
        if (query?.length === 0) {
          this.results.set([]);
          this.loading.set(false);
          return false;
        }
        return true; // continue if query is not empty
      }),
      filter(([query, lang]) => !!query && query.length >= 3 && !!lang),
      // use switchMap to cancel unfinished requests when new ones come
      switchMap(([query, lang]) => {
        this.loading.set(true);
        return this.wikiApi.search(lang ? lang : "", query ? query : "").pipe(
          catchError(() => {
            this.loading.set(false);
            return of(getEmptyWikiResponse());
          }),
          finalize(() => {
            this.loading.set(false);
          })
        );
      }),
      map((res: WikiSearchResponse) => res.query.search),
    );

    results$.subscribe(result => {
      this.results.set(result);
      this.loading.set(false);
    })
  }

  modalElement = viewChild<ElementRef>("searchModelRef");
  searchInput = viewChild<ElementRef>("searchInput");
  private searchModal!: Modal;
  private destroy$ = new Subject<void>();

  ngAfterViewInit() {
    const element = this.modalElement();
    if (element) {
      this.searchModal = new Modal(element.nativeElement);

      fromEvent(element.nativeElement, 'hidden.bs.modal')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.gameState.modalIsOpen.set(false);
        })

      fromEvent(element.nativeElement, 'shown.bs.modal')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.gameState.modalIsOpen.set(true);
          const input = this.searchInput();
          if (input) {
            input.nativeElement.focus();
            input.nativeElement.select();
          }
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  show() {
    this.searchModal?.show();
  }

  openArticle(title: string) {
    this.gameState.reset();
    this.router.navigateByUrl(`/${this.searchLang.value}.wikipedia.org/wiki/` +
      `${this.wikiApi.urlEncodeTitle(title)}`)
    this.gameState.articleTitle.set(title);
    this.searchTerm.setValue(title);
    this.searchModal.hide();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.gameState.modalIsOpen()) {
      return;
    }

    if (event.key === 'Enter') {
      const activeElement = document.activeElement;
      if (this.searchInput()?.nativeElement === activeElement) {
        if (this.results().length > 0) {
          this.openArticle(this.results()[0].title);
        }
        event.preventDefault(); // prevent default browser behavior
      }
    } else if (event.key === 'Escape') {
      this.searchModal.hide();
      event.preventDefault(); // prevent default Escape behavior
    }
  }
}

