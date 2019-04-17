// import { async, ComponentFixture, TestBed } from '@angular/core/testing';

// import { QuotesListComponent } from './quotes.component';
// import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// import { LoggerService, HttpService } from '@core';
// import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
// import { TranslateModule } from '@ngx-translate/core';
// import { QuotesModel } from './quotes.model';

// describe('QuotesListComponent', () => {
//   let component: QuotesListComponent;
//   let fixture: ComponentFixture<QuotesListComponent>;
//   let quotesModel: QuotesModel;

//   let dummyQuoteList = {
//     "startIndex": 0,
//     "pageSize": 10,
//     "pageCount": 1,
//     "totalCount": 2,
//     "items": [
//      {
//       "id": "0da178726c6b9e27784ebfec0000432a",
//       "name": "Test Quote One",
//       "siteId": 21127,
//       "tenantId": 17194,
//       "number": 1,
//       "items": [],
//       "auditInfo": {
//        "updateDate": "2019-03-31T19:52:25.091Z",
//        "createDate": "2019-03-31T19:52:25.091Z",
//        "updateBy": "1",
//        "createBy": "1"
//       },
//       "destinations": [],
//       "isTaxExempt": false,
//       "currencyCode": "USD",
//       "customerInteractionType": "Unknown",
//       "orderDiscounts": [],
//       "subTotal": 0,
//       "itemLevelProductDiscountTotal": 0,
//       "orderLevelProductDiscountTotal": 0,
//       "itemTaxTotal": 0,
//       "itemTotal": 0,
//       "total": 0,
//       "shippingDiscounts": [],
//       "itemLevelShippingDiscountTotal": 0,
//       "orderLevelShippingDiscountTotal": 0,
//       "shippingAmount": 0,
//       "shippingSubTotal": 0,
//       "shippingTaxTotal": 0,
//       "shippingTotal": 0,
//       "handlingDiscounts": [],
//       "itemLevelHandlingDiscountTotal": 0,
//       "orderLevelHandlingDiscountTotal": 0,
//       "handlingSubTotal": 0,
//       "handlingTaxTotal": 0,
//       "handlingTotal": 0,
//       "dutyTotal": 0,
//       "feeTotal": 0
//      }]
//     };

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       imports: [TranslateModule ],
//       declarations: [ QuotesListComponent ],
//       schemas:[CUSTOM_ELEMENTS_SCHEMA],
//       providers: [LoggerService, CustomNGXLoggerService, NGXLoggerHttpService, HttpService]
//     })
//     .compileComponents();

//     //To access external model class
//     quotesModel = new QuotesModel();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(QuotesListComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it("Application should call ngOnInit()", function() {
//         component.ngOnInit();
//         expect(component).toBe('QuotesListComponent : ngOnInit');
//     });

//     it("Application should call ngOnInit()", function() {
//         component.populateQuoteGrid();
//         quotesModel.items = dummyQuoteList.items;

//         expect(component).toBe('QuotesListComponent : ngOnInit');
//     });
// });
