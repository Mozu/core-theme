import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';

import { TranslateLoader, TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';

import { NavigationTopQuotesComponent } from '@shared';

describe('NavigationTopQuotesComponent', () => {
  let component: NavigationTopQuotesComponent;
  let fixture: ComponentFixture<NavigationTopQuotesComponent>;
  let translateService : TranslateService

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [ NavigationTopQuotesComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [TranslateService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationTopQuotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
