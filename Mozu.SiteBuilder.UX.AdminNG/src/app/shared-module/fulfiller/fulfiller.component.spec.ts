import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FulfillerComponent } from './fulfiller.component';

describe('FulfillerComponent', () => {
  let component: FulfillerComponent;
  let fixture: ComponentFixture<FulfillerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FulfillerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FulfillerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
