import {
  Component,
  AfterViewInit,
  viewChild,
  ElementRef,
  signal,
  inject
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';
import { LanguageOption } from './language-option.model';
import { HttpClient } from '@angular/common/http';
import {
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  of,
  startWith,
  switchMap,
  map
} from 'rxjs';
import {
  getEmptyWikiResponse,
  WikiResponse,
  WikiResult,
} from './wikipedia-query.model';

@Component({
  selector: 'app-search-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './search-modal.component.html',
  styleUrl: './search-modal.component.css'
})
export class SearchModalComponent implements AfterViewInit {
  searchTerm = new FormControl("");
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

  private http = inject(HttpClient);
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
        return this.http.get<WikiResponse>(
          `https://${lang}.wikipedia.org/w/api.php`,
          {
            params: {
              action: 'query',
              list: 'search',
              format: 'json',
              origin: '*',
              srsearch: query ? String(query) : '',
            }
          }
        ).pipe(
          catchError(() => {
            this.loading.set(false);
            return of(getEmptyWikiResponse());
          })
        );
      }),
      map((res: WikiResponse) => res.query.search),
    );

    results$.subscribe(result => {
      this.results.set(result);
      this.loading.set(false);
    })
  }

  modalElement = viewChild<ElementRef>("searchModelRef");
  private searchModal!: Modal;

  ngAfterViewInit() {
    const element = this.modalElement();
    if (element) {
      this.searchModal = new Modal(element.nativeElement);
    }
  }

  show() {
    this.searchModal?.show();
  }

  openArticle(title: string) {
    const url =
      `https://${this.searchLang.value}.wikipedia.org/wiki/` +
      `${encodeURIComponent(title)}`;

    window.open(url);
  }
}

