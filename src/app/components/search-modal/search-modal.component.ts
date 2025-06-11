import { Component, AfterViewInit, viewChild, ElementRef } from '@angular/core';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-search-modal',
  imports: [],
  templateUrl: './search-modal.component.html',
  styleUrl: './search-modal.component.css'
})
export class SearchModalComponent implements AfterViewInit {

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

