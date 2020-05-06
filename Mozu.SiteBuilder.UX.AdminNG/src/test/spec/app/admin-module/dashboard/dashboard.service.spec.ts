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

    it('Application is inside MapDasasboardCategoryToTiles() which is calling from pupulateSystemAndMainTiles() of dashboard component', () => {
      dashbaordService.MapDasasboardCategoryToTiles(dummyData_pupulateSystemAndMainTiles);
        expect(loggerServiceSpy).toHaveBeenCalledWith("AdminDashboardComponent : MapDasasboardCategoryToTiles");
    });

    it('Should return an Dashboard tiles list as Observable', () => {
      dashbaordService.fetchAllDashboardTiles().subscribe(quotes => {
          expect(loggerServiceSpy).toHaveBeenCalledWith("AdminDashboardComponent : fetchAllDashboardTiles");
      },
      err => {
          expect(err).toBe(`Error on data fetching.`)
      })
      const req = httpMock.expectOne(`/assets/json/dashboard-categories.json`);
      expect(req.request.method).toBe("GET");
      req.flush(dummyData_pupulateSystemAndMainTiles);
      httpMock.verify();
});

   

});

