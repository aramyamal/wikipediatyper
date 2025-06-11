import { Component, AfterViewInit, viewChild, ElementRef } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-search-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './search-modal.component.html',
  styleUrl: './search-modal.component.css'
})
export class SearchModalComponent implements AfterViewInit {

  searchTerm = new FormControl("");

  modalElement = viewChild<ElementRef>("searchModelRef");
  private searchModal!: Modal;

  array = [...Array(5).keys()]

  ngAfterViewInit() {
    const element = this.modalElement();
    if (element) {
      this.searchModal = new Modal(element.nativeElement);
    }
  }

  show() {
    this.searchModal?.show();
  }
}

