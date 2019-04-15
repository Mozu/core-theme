// import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
// import { AdminDashboardComponent } from './dashboard.component';
// import { AccessTileComponent } from '@shared/access-tile/access-tile.component';
// import { NO_ERRORS_SCHEMA, DebugElement, ElementRef } from '@angular/core';
// import { HttpClientModule, HttpClient, HttpHandler } from '@angular/common/http';
// import { DashbaordService } from './dashboard.service';
// import { NotificationService } from '@global';
// import { LoggerService } from '@core';
// import { By } from '@angular/platform-browser';
// import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
// import { DashboardModel } from './dashboard.model';
// import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';

// describe('DashboardComponent', () => {
//   let component: AdminDashboardComponent;
//   let fixture: ComponentFixture<AdminDashboardComponent>;
//   let dashboardModel: DashboardModel;
  
//   let debugElement: DebugElement;
//   let loggerService: LoggerService;
//   let loggerServiceSpy: any;
//   let dashboardService: DashbaordService;
//   let httpMock: HttpTestingController;

//   const mockErrorResponse = { status: 400, statusText: 'Bad Request' };
//   const dashboardJson = [
//     {
//         "tabID": "1",
//         "tabName": "Main"
//     },
//     {
//         "tabID": "2",
//         "tabName": "System"
//     }
// ];

// let dummyData_pupulateSystemAndMainTiles = [
//     {
//       "id": "products",
//       "navParent": "main",
//       "label": "Catalog",
//       "imageURL": "./assets/Images/catlog.png",
//       "icon": "nav-catalog",
//       "behaviorIds": [ 4 ],
//       "items": [
//         {
//           "id": "catalogProducts",
//           "label": "Products",
//           "address": "products",
//           "behaviorIds": [ 4 ]
//         },
//         {
//           "id": "categories",
//           "label": "Categories",
//           "address": "categories",
//           "behaviorIds": [ 16 ]
//         }
//       ]
//     }];

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       imports: [HttpClientModule,HttpClientTestingModule],
//       declarations: [ AdminDashboardComponent, AccessTileComponent ],
//       schemas: [NO_ERRORS_SCHEMA],
//       providers: [DashbaordService, NotificationService, LoggerService,CustomNGXLoggerService,
//         NGXLoggerHttpService]
//     })
//     .compileComponents();

//     fixture = TestBed.createComponent(AdminDashboardComponent);
//     component = fixture.componentInstance;
//     debugElement = fixture.debugElement;

//     //To inject services using spyOn
//     loggerService = debugElement.injector.get(LoggerService);
//     loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();

//     dashboardService = TestBed.get(DashbaordService);
//     httpMock = TestBed.get(HttpTestingController);

//     //To access external model class
//     dashboardModel = new DashboardModel();
    
//   }));

//     it('Application should create dashboard Component', () => {
//         //expect(component).toBeTruthy();
//         expect(component).toBeDefined();
//     });

//     it('Application is inside ngOnInit() of dashboard component', () => {
//         component.ngOnInit();
//         expect(loggerServiceSpy).toHaveBeenCalledWith("AdminDashboardComponent : ngOnInit");
//     });

//     it("Application isShowSystemTiles will be false if active tab name is Main", function() {
//         component.ngOnInit();
//         dashboardModel.isShowSystemTiles = false;
//         let activeTab = "Main";
//         dashboardModel.isShowSystemTiles = (activeTab === "System");
//         expect(dashboardModel.isShowSystemTiles).toBe(false, 'isShowSystemTiles will be false if active tab is Main');
//     });

//     it("Application isShowSystemTiles will be true if active tab name is System", function() {
//         component.ngOnInit();
//         dashboardModel.isShowSystemTiles = false;
//         let activeTab = "System";
//         dashboardModel.isShowSystemTiles = (activeTab === "System");
//         expect(dashboardModel.isShowSystemTiles).toBe(true, 'isShowSystemTiles will be true if active tab is System');
//     });

//     it('Application is inside pupulateSystemAndMainTiles() of dashboard component', () => {
//         component.pupulateSystemAndMainTiles();
//         expect(loggerServiceSpy).toHaveBeenCalledWith("AdminDashboardComponent : pupulateSystemAndMainTiles");
//     });

//     it('Application should call fetchAllDashboardTiles() dashboard service and print success reponse as "AdminDashboardComponent : _dashboardService.fetchAllDashboardTiles_successResponse"', () => {
//         component.pupulateSystemAndMainTiles();
//          const req = httpMock.expectOne(`./assets/json/dashboard-categories.json`, "sample url test from dashboard component");
//          expect(req.request.method).toBe("GET");
//          req.flush(dummyData_pupulateSystemAndMainTiles);
//          httpMock.verify();
//          expect(loggerServiceSpy).toHaveBeenCalledWith("AdminDashboardComponent : _dashboardService.fetchAllDashboardTiles_successResponse");
//     });

//     // it('Application is inside MapDasasboardCategoryToTiles() which is calling from pupulateSystemAndMainTiles() of dashboard component', () => {
//     //     component.pupulateSystemAndMainTiles();
//     //     const req = httpMock.expectOne(`./assets/json/dashboard-categories.json`, "sample url test from dashboard component");
//     //      expect(req.request.method).toBe("GET");
//     //      req.flush(dummyData_pupulateSystemAndMainTiles);
//     //      httpMock.verify();
//     //     expect(loggerServiceSpy).toHaveBeenCalledWith("AdminDashboardComponent : MapDasasboardCategoryToTiles");
//     // });

//     it('Application should call fetchAllDashboardTiles() dashboard service and print error reponse as "AdminDashboardComponent : _dashboardService.fetchAllDashboardTiles_errResponse"', () => {
//         component.pupulateSystemAndMainTiles();
//          const req = httpMock.expectOne(`./assets/json/dashboard-categories.json`, "sample url test from dashboard component");
//          expect(req.request.method).toBe("GET");
//          req.flush(dummyData_pupulateSystemAndMainTiles, mockErrorResponse);
//          httpMock.verify();
//          expect(loggerServiceSpy).toHaveBeenCalledWith("AdminDashboardComponent : _dashboardService.fetchAllDashboardTiles_errResponse");
//     });

//     // it('Application is inside ngOnDestroy() of dashboard component', () => {
//     //     component.ngOnDestroy();
//     //     expect(loggerServiceSpy).toHaveBeenCalledWith("AdminDashboardComponent : ngOnDestroy");
//     // });

//     // it('Application toolbar should have dashboard class', () => {
//     //     const fixture = TestBed.createComponent(AdminDashboardComponent);
//     //     const el = fixture.debugElement.query(By.css('.dashboard'));
//     //     expect(el).toBeTruthy();
//     // });
  
//     afterEach(() => {
//         fixture.destroy();
//     })
// });
