import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, DebugElement } from '@angular/core';
import { LoggerService, TostrService } from '@core'
import { By } from '@angular/platform-browser';
import { HttpClientModule, HttpClient, HttpHandler } from '@angular/common/http';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { TableModule } from 'primeng/table';
import {  MessageService } from 'primeng/components/common/api';

import {  } from '@core';
import { UtilityService, EnvironmentConfig } from '@core/infrastructure/utility.service';
import { AuthService } from '@core/extensions/auth.service';
import { HttpClientService, httpClientServiceCreator } from '@core/extensions/http-client.service';

import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { TranslateLoader, TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';

import { LocationGroupCreateComponent } from 'app/location-groups-module/create/create.component';
import { CreateLocationGroupService } from 'app/location-groups-module/create/create.service';
import { LocationGroupModel } from 'app/location-groups-module/create/location.group.model';
import { SharedDataService, NotificationService } from '@global';
import { Constants as GlobalConstant } from '@global/infrastructure/constants';
import { GlobalModule } from "@global/global.module";
import { Tree, TreeNode } from '@angular/router/src/utils/tree';
import { LocationsListModel } from '@shared';
import { DebugRenderer2 } from '@angular/core/src/view/services';

describe('CreateLocationGroupComponent', () => {
  let component: LocationGroupCreateComponent;
  let fixture: ComponentFixture<LocationGroupCreateComponent>;
  let debugElement: DebugElement;
  let loggerService: LoggerService;
  let environment: EnvironmentConfig;
  let loggerServiceSpy: any;
  let httpMock: HttpTestingController;
  const mockErrorResponse = { status: 400, statusText: 'Bad Request' };
  let element: HTMLElement;        
  let createLocationGroupService: CreateLocationGroupService
  let dummyLocationGroup;
  //let getSpy;
  //let selectedPhysicalLocation: TreeNode;
  
  beforeEach( async(() => {
    
    dummyLocationGroup = 
    {
        "locationGroupId": 5,
        "siteIds": [
         21550
        ],
        "name": "Another Group of Locations",
        "locationCodes": [
         "roletest10",
         "roletest11",
         "roletest12"
        ],
        "auditInfo": {
         "updateDate": "2019-04-26T15:26:46.969Z",
         "createDate": "2019-04-26T15:26:46.969Z",
         "updateBy": "1",
         "createBy": "1"
        }
       };

    // Create a fake CreateService object with a `getQuote()` spy
  //const createService = jasmine.createSpyObj('CreateLocationGroupService', ['addLocationGroup', 'getLocationGroup', 'updateLocationGroup']);
  // Make the spy return a synchronous Observable with the test data
  //let addSpy = createService.addLocationGroup.and.returnValue(of(dummyLocationGroup) );
  //getSpy = createService.getLocationGroup.and.returnValue(of(dummyLocationGroup)).and.callThrough();
  //let editSpy = createService.updateLocationGroup.and.returnValue(of(dummyLocationGroup) );

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientModule, HttpClientTestingModule, TableModule, GlobalModule],
      declarations: [LocationGroupCreateComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [By, TranslateService, LoggerService, CustomNGXLoggerService,
        NGXLoggerHttpService, UtilityService, EnvironmentConfig, AuthService, LocationGroupModel,  
          SharedDataService, NotificationService, FormBuilder, TostrService, MessageService, CreateLocationGroupService, 
        {
          provide: HttpClientService,
          useFactory: httpClientServiceCreator,
          deps: [HttpClient, UtilityService, AuthService]
        },
        {
          provide: Router,
          useValue: class { navigate = jasmine.createSpy("navigate"); }
        },
        
        {
          provide: ActivatedRoute,
          useValue: 
            {
              snapshot:
                {
                  data: [{ mode: 'Edit' }, { mode: 'Create' }]
                 }
            }                  
        }
      ]
    })
    .compileComponents();    

  }));
  

  beforeEach(async(() => {
    httpMock = TestBed.get(HttpTestingController);
    var respData = {
      items: {
        "ctTenant": {
          "sites":[{
            "tenantId": 20072,
            "masterCatalogId": 1,
            "catalogId": 2,
            "countryCode": "US",
            "defaultLocaleCode": "en-US",
            "defaultCurrencyCode": "USD",
            "isMozuRendered": true,
          }]
        }
      }};

    const req = httpMock.expectOne(GlobalConstant.webApis.getSharedData);
    expect(req.request.method).toBe("GET");
    req.flush(respData);
    httpMock.verify();

    fixture = TestBed.createComponent(LocationGroupCreateComponent);
    component = fixture.debugElement.componentInstance;
    createLocationGroupService = TestBed.get(CreateLocationGroupService)
    loggerService = TestBed.get(LoggerService);
    loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();

   }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should initiate values when Angular calls ngOnInit()", async(() => {

    const spy = spyOn(component, 'fetchSitesData');

    //component.ngOnInit(); 
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith('LocationGroupCreateComponent : ngOnInit');
    expect(component.model.isSticky).toEqual(false);
    expect(component.model.selectedLocations).toEqual([]);
     
    
    component.model.formMode = "Edit";
    fixture.detectChanges();

    
    //let spyserv = spyOn(createLocationGroupService, 'getLocationGroup').and.callThrough();
    //expect(spyserv.calls.any()).toBe(true, 'getLocationGroup() method should be called');

    fixture.whenStable().then(() => {
      expect(spy).toHaveBeenCalled(); 
      //expect(spyserv).toHaveBeenCalled();      
      expect(component.model.subscriptions.length).toEqual(2);    
    });

   }));

  it("should call locationSelected()", async() => {

    // const spy = spyOn(component, 'physicalLocationSelected');

    // fixture.detectChanges();
    // fixture.debugElement.query(By.directive (''))
    // const cell = fixture.debugElement. (By.name('physical-locations'))[0];
    // cell.nativeElement.click();

    // component.ngOnInit();
    
    let dummyLocation = 
    {
      
        "code":"code1",
        "name": 'location1'
    
    }

    // let dummyLocationGroup = 
    // {
    //     "locationGroupId": 5,
    //     "siteIds": [
    //      21550
    //     ],
    //     "name": "Another Group of Locations",
    //     "locationCodes": [
    //      "roletest10",
    //      "roletest11",
    //      "roletest12"
    //     ],
    //     "auditInfo": {
    //      "updateDate": "2019-04-26T15:26:46.969Z",
    //      "createDate": "2019-04-26T15:26:46.969Z",
    //      "updateBy": "1",
    //      "createBy": "1"
    //     }
    //    };

       // arrange
    //component.model.  = dummyLocation;
    fixture.detectChanges();
    const spy = spyOn(component, "locationSelected");

    // act
    let inlineEditElement: DebugElement = fixture.debugElement.query(By.css("locations-list"));

    inlineEditElement.triggerEventHandler("locationSelected", dummyLocation);

    fixture.detectChanges();
  });

  it('should call locationSelected and location is selected', async() => {
    let dummyLocation = 
    {
      
        "code":"code1",
        "name": 'location1'
    
    }
    fixture.detectChanges();
    component.locationSelected(dummyLocation);

    expect(component.model.selectedLocations).toContain(dummyLocation);
    expect(loggerServiceSpy).toHaveBeenCalledWith("LocationGroupCreateComponent : locationSelected");
    
  });

  it('should call locationUnselected and location is unselected', async() => {
    let dummyLocation = 
    {
      
        "code":"code1",
        "name": 'location1'
    
    }
    fixture.detectChanges();
    
    component.locationUnselected(dummyLocation);

    expect(component.model.selectedLocations).toEqual([]);
    expect(loggerServiceSpy).toHaveBeenCalledWith("LocationGroupCreateComponent : locationUnselected");
  });

  it('should run locationChanged with add operation and location is added', async () => {
    
    let dummyLocationsChanged = 
    {
      "data": [{
      
      "code":"code2",
      "name": 'location2'
  
    }], "operation":'add'}

    let dummyLocation = 
    {
      
        "code":"code1",
        "name": 'location1'
    
    }

    fixture.detectChanges();
    component.model.selectedLocations = [dummyLocation];
    component.locationsChanged(dummyLocationsChanged);

    expect(loggerServiceSpy).toHaveBeenCalledWith("LocationGroupCreateComponent : locationsChanged");
    
    expect(component.model.selectedLocations).toContain(dummyLocationsChanged.data[0]);

  });

  it('should run locationchanged with remove operation and location is removed', async () => {
    let dummyLocationsChanged = 
    {
      "data": [{
      
      "code":"code1",
      "name": 'location1'
  
      }], "operation":'remove'}

    let dummyLocation = 
    {
      
        "code":"code1",
        "name": 'location1'
    
    }
    fixture.detectChanges();
    component.model.selectedLocations = [dummyLocation];
    component.locationsChanged(dummyLocationsChanged);
    expect(loggerServiceSpy).toHaveBeenCalledWith("LocationGroupCreateComponent : locationsChanged");    
    expect(component.model.selectedLocations).toEqual([]);
  });

  it('should run #ngAfterViewInit()', async () => {
    // const result = component.ngAfterViewInit();
  });

  it('should run ngOnDestroy()',  () => {
    // debugger;
    // fixture.destroy();

    // let spy = spyOn(component, "ngOnDestroy");

    // fixture.detectChanges();
    // expect(loggerServiceSpy).toHaveBeenCalledWith("LocationGroupCreateComponent : ngOnDestroy");

    // fixture.whenStable().then(() =>
    // {
    //   debugger;
    //   expect(component.model.subscriptions.length).toEqual(0);
    // });
  });

  it('should run #physicalLocationSelected()', async () => {
    // const result = component.physicalLocationSelected(selectedPhysicalLocation);
  });
  
  it('should run #scrollHandler()', async () => {
    // const result = component.scrollHandler(event);
  });

  it('should run #scrollToTop()', async () => {
    // const result = component.scrollToTop(el);
  });

  it('should run #scrollToLocationGrid()', async () => {
    // const result = component.scrollToLocationGrid(el);
  });

  it('should run #saveLocationGroup()', async () => {
    // const result = component.saveLocationGroup();
  });

  it('should run #updateLocationGroup()', async () => {
    // const result = component.updateLocationGroup();
  });

  it('should run #cancelLocationGroup()', async () => {
    // const result = component.cancelLocationGroup();
  });

  it('should run #createLocationGroup()', async () => {
    // component.createLocationGroup(lgModel);
  });

  it('should run #validateLocationGroup()', async () => {
    // const result = component.validateLocationGroup(lgModel);
  });

  it('should run #onSaveSuccess()', async () => {
    // const result = component.onSaveSuccess(result);
  });

  it('should run #onSaveError()', async () => {
    // const result = component.onSaveError(errmsg);
  });
  
});


