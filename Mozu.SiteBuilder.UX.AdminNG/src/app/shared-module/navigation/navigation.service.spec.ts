import {
  TestBed, inject
} from '@angular/core/testing';
import { NavigationService } from '@shared';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('NavigationService', () => {
    let injector: TestBed;
    let service: NavigationService;
    let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [
            HttpClientTestingModule,    
          ],
      providers: [
        NavigationService
      ]
    });

    service = TestBed.get(NavigationService);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    });

    

    it('Application should return an tab name Observable<any>', () => {
        let dummyTabsName = [
          {
            "tabID": "1",
            "tabName": "Main"
        },
        {
            "tabID": "2",
            "tabName": "System"
        }
       ];
        
        service.fetchTabsName().subscribe(tabsNames => {
        expect(dummyTabsName.length).toBe(2);
        expect(tabsNames[1].tabName).toBe("System");
        },
        err => {
        expect(err).toBe(`Error on data fetching.`)
        })
        const req = httpMock.expectOne(`./assets/json/dashboard-menu.json`, "Same tab name");
        expect(req.request.method).toBe("GET");
        req.flush(dummyTabsName);
        httpMock.verify();
        });

        it('Application should return an navigation item Observable<any>', () => {
          let dummyMenuitems = [
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
          
          service.fetchLeftNavigationItems().subscribe(leftNavigationItems => {
          expect(dummyMenuitems.length).toBe(1);
          expect(leftNavigationItems[0].id).toBe("products");
          },
          err => {
          expect(err).toBe(`Error on data fetching.`)
          })
          const req = httpMock.expectOne(`./assets/json/leftNavigation-items.json`, "sample url test");
          expect(req.request.method).toBe("GET");
          req.flush(dummyMenuitems);
          httpMock.verify();
          });
});