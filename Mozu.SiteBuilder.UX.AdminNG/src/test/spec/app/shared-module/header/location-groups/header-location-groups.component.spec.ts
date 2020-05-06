import { async, ComponentFixture, TestBed } from '@angular/core/testing'; 
import { HeaderLocationGroupsComponent } from 'app/shared-module/header/location-groups/header-location-groups.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService, EnvironmentConfig, UtilityService, LoggerService, HttpClientService, httpClientServiceCreator, SpinnerService } from '@core';
import { NGXLoggerHttpService, CustomNGXLoggerService } from 'ngx-logger';
import { HeaderLocationGroupsService } from '@shared/header/location-groups/HeaderLocationGroupsService';
import { Router, ActivatedRoute, UrlTree } from '@angular/router';
import { Location, LocationStrategy, PathLocationStrategy } from "@angular/common";
import { NotificationService } from '@global';
import { Observable } from 'rxjs';
 
describe('HeaderLocationGroupsComponent', () => {
  let component: HeaderLocationGroupsComponent;
  let fixture: ComponentFixture<HeaderLocationGroupsComponent>;
  const dummyRouter = { 
      navigate: jasmine.createSpy('navigate'), 
      events: new Observable<Event>(),
      parseUrl: function(url: string) {
          return { root: {children: {primary: {segments: null}}} }
      }
    };
  const fakeActivatedRoute = {
    snapshot: { data: { } }
  } as ActivatedRoute
  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
            TranslateModule.forRoot(),
            HttpClientModule,
        HttpClientTestingModule,
        
        ],
        providers: [
            TranslateService,
            LoggerService,
        CustomNGXLoggerService,
        NGXLoggerHttpService,
        UtilityService,
        EnvironmentConfig,
        AuthService,
        HeaderLocationGroupsService,
        {
            provide: HttpClientService,
            useFactory: httpClientServiceCreator,
            deps: [HttpClient,
              UtilityService,
              AuthService]
          },
          {
            provide: Router,
            useValue: dummyRouter,
          },
          { provide: ActivatedRoute, useValue: fakeActivatedRoute },
           Location,
          { provide: LocationStrategy, useClass: PathLocationStrategy },
          NotificationService,
          SpinnerService,
          ChangeDetectorRef
        ],
        declarations: [ 
            HeaderLocationGroupsComponent,
         ],
        schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));
 
  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderLocationGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
 
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});