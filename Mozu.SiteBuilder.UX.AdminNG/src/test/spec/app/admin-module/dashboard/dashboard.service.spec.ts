import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing'
import { DashbaordService } from '@admin/dashboard/dashboard.service';
import { LoggerService } from '@core';
import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { UtilityService, EnvironmentConfig } from '@core/infrastructure/utility.service';
import { AuthService } from '@core/extensions/auth.service';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { HttpClientService, httpClientServiceCreator } from '@core/extensions/http-client.service';


describe('DashboardService', () => { 
    let dashbaordService: DashbaordService;
    let loggerService: LoggerService;
    let loggerServiceSpy: any;
    let httpMock: HttpTestingController;
    const mockErrorResponse = { status: 400, statusText: 'Bad Request' };

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DashbaordService, LoggerService, CustomNGXLoggerService, NGXLoggerHttpService, UtilityService, EnvironmentConfig, AuthService,
              {
                provide: HttpClientService,
                useFactory: httpClientServiceCreator,
                deps: [HttpClient, UtilityService, AuthService]
              }
]

        });

        dashbaordService = TestBed.get(DashbaordService);
        loggerService = TestBed.get(LoggerService);
        httpMock = TestBed.get(HttpTestingController);

        loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();

    });

    // it('Application should call dashboard service and return json object', () => {
    //     let dummyDashboardTiles = [
    //         {
    //           "id": "products",
    //           "navParent": "main",
    //           "label": "Catalog",
    //           "imageURL": "./assets/Images/catlog.png",
    //           "icon": "nav-catalog",
    //           "behaviorIds": [ 4 ],
    //           "items": [
    //             {
    //               "id": "catalogProducts",
    //               "label": "Products",
    //               "address": "products",
    //               "behaviorIds": [ 4 ]
    //             },
    //             {
    //               "id": "categories",
    //               "label": "Categories",
    //               "address": "categories",
    //               "behaviorIds": [ 16 ]
    //             }
    //           ]
    //         }];

    //         dashbaordService.fetchAllDashboardTiles().subscribe(dashboardTiles => {
    //         //console.log(dashboardTiles);
    //         expect(dashboardTiles.length).toBe(1);
    //         expect(dashboardTiles[0].label).toBe("Catalog");
    //         expect(dashboardTiles[0].items[1].label).toBe("Categories"); //links
    //     },
    //     err => {
    //         expect(err).toBe(`Invalid Data`);
    //         console.log(err);
    //     })

    //     const req = httpMock.expectOne(`./assets/json/dashboard-categories.json`, "sample url test from dashboard service");
    //     expect(req.request.method).toBe("GET");
    //     req.flush(dummyDashboardTiles);
    //     //req.flush(dummyDashboardTiles, mockErrorResponse);
    //     httpMock.verify();

    // });

    it('Application is inside MapDasasboardCategoryToTiles() which is calling from pupulateSystemAndMainTiles() of dashboard component', () => {
      let dummyData_pupulateSystemAndMainTiles = [
        {
          "id": "products",
          "navParent": "main",
          "label": "Catalog",
          "imageURL": "./assets/Images/catlog.png",
          "icon": "nav-catalog",
          "behaviorIds": [ 4 ],
          "items": [
            {
              "id": "catalogProducts",
              "label": "Products",
              "address": "products",
              "behaviorIds": [ 4 ]
            },
            {
              "id": "categories",
              "label": "Categories",
              "address": "categories",
              "behaviorIds": [ 16 ]
            }
          ]
        }];  
      dashbaordService.MapDasasboardCategoryToTiles(dummyData_pupulateSystemAndMainTiles);
        expect(loggerServiceSpy).toHaveBeenCalledWith("AdminDashboardComponent : MapDasasboardCategoryToTiles");
    });

});

