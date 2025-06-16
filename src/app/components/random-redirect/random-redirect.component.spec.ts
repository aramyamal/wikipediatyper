import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomRedirectComponent } from './random-redirect.component';

describe('RandomRedirectComponent', () => {
  let component: RandomRedirectComponent;
  let fixture: ComponentFixture<RandomRedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RandomRedirectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RandomRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
