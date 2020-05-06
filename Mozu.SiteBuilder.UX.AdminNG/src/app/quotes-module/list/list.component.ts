import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy
} from '@angular/core';

import { Router } from '@angular/router';
import {
  CurrencyPipe,
  DatePipe
} from '@angular/common';
import {
  LoggerService,
  HttpError,
  ErrorCode,
  ErroNotificationType,
  SpinnerService,
  UtilityService
} from '@core';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@global';
import {
  Constants,
  ToggleGridColumnsComponent,
  NotificationQuoteActions
} from '@shared';

import { QuotesListService } from './list.service';

import { QuotesListModel } from './list.model';
import { LazyLoadEvent } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'quotes-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  providers: [QuotesListService]
})
export class QuotesListComponent implements OnInit, OnDestroy {
  public model: QuotesListModel;
  gridColumnHeader: any[];
  selectedGridColumnHeader: any[];
  GridColumnsOnOverlayPanel: any[];

  constructor(private _quotesListService: QuotesListService,
    private _loggerService: LoggerService,
    private _translate: TranslateService,
    private router: Router,
    private _spinner: SpinnerService,
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe,
    private _notificationService: NotificationService,
    private _utilityService: UtilityService) { }

  @ViewChild(ToggleGridColumnsComponent) toggleGridColumnsComponent: ToggleGridColumnsComponent;

  OpenGridColumnOverlayPanel(event: any) {
    this.toggleGridColumnsComponent.gridColumnToggle.toggle(event);
  }

  ngOnInit() {
    this._loggerService.info('QuotesListComponent : ngOnInit');
    this.model = new QuotesListModel();
    this.model.items = [];
    this.model.quoteGridContextMenuItem = [];
    this.model.subscriptions = [];

    this._translate.get('QUOTES.GridContextMenu').subscribe((successResponse) => {
      this.gridContextMenu(successResponse);
    });

    if (localStorage.getItem(Constants.localStorageKeys.quoteGridData) != null) {
      const gridStateValue = JSON.parse(localStorage.getItem(Constants.localStorageKeys.quoteGridData));
      this.gridColumnHeader = gridStateValue['columnHeader'];
      this.model.sortField = gridStateValue['sortField'];
      this.model.sortOrder = gridStateValue['sortOrder'];
    } else {
      this.gridColumnHeader = [
        { field: 'name', header: 'QUOTES.GridHeader.quoteName', checked: true, sortable: true },
        { field: 'accountName', header: 'QUOTES.GridHeader.accountName', checked: true, sortable: false },
        { field: 'accountUser', header: 'QUOTES.GridHeader.accountUser', checked: false, sortable: false },
        { field: 'quoteNumber', header: 'QUOTES.GridHeader.quoteID', checked: false, sortable: true },
        { field: 'auditInfo.createDate', header: 'QUOTES.GridHeader.createDate', checked: true, sortable: true },
        { field: 'auditInfo.createBy', header: 'QUOTES.GridHeader.createdBy', checked: false, sortable: true },
        { field: 'expirationDate', header: 'QUOTES.GridHeader.expirationDate', checked: true, sortable: true },
        { field: 'status', header: 'QUOTES.GridHeader.status', checked: true, class: 'content-pill', sortable: true },
        { field: 'submitDate', header: 'QUOTES.GridHeader.submitDate', checked: false, sortable: true },
        { field: 'auditInfo.updateDate', header: 'QUOTES.GridHeader.updateDate', checked: false, sortable: true },
        { field: 'numberOfProducts', header: 'QUOTES.GridHeader.numProducts', checked: false, sortable: false },
        { field: 'totalQuantity', header: 'QUOTES.GridHeader.totalQty', checked: false, sortable: false },
        { field: 'shippingTaxTotal', header: 'QUOTES.GridHeader.estimatedCharges', checked: true, sortable: false },
        { field: 'total', header: 'QUOTES.GridHeader.orderTotal', checked: true, sortable: true },
        { field: 'projectName', header: 'QUOTES.GridHeader.projectName', checked: true, sortable: true }
      ];
    }
    this.selectedGridColumnHeader = this.gridColumnHeader;

    this.model.subscriptions.push(
      this._notificationService.quoteSearched.subscribe((advancedSearch: string) => {
        this.model.advancedSearch = advancedSearch;
        this.model.startIndex = 0;
        this.populateQuoteGrid(advancedSearch, this.model.startIndex, this.model.pageSize, this.model.sortResult);
      })
    );

    this._notificationService.notifyQuoteEdited(NotificationQuoteActions.list);
  }
  onRowSelect(event) {
    this.model.selectedQuote = event.data;
    // open in edit mode
    if (event && event.originalEvent && event.originalEvent.target &&
      event.originalEvent.target.classList &&
      event.originalEvent.target.classList.value === Constants.classess.ellipsis) {
      // open action menu.
    } else {
      this.viewQuote();
    }
  }

  public gridContextMenu = (contextMenu) => {
    this.model.quoteGridContextMenuItem.push({ label: contextMenu.edit, command: (event) => this.viewQuote() });
  }

  viewQuote() {
    const quoteId = this.model.selectedQuote.id;
    this.router.navigate(['/' + Constants.uiRoutes.quotesEdit + '/' + quoteId]);
    this._notificationService.notifyQuoteEdited(NotificationQuoteActions.edit);
  }

  public populateQuoteGrid = (advSearch?: string, startIndex?: number, pageSize?: number, sort?: string) => {
    this._spinner.start();
    this._loggerService.info('QuotesListComponent : populateQuoteGrid');
    this._quotesListService.fetchAllQuotes(advSearch, startIndex, pageSize, sort)
      .subscribe((quotesListSuccessResponse: QuotesListModel) => {
        this._loggerService.info('QuotesListComponent : _quotesListService.fetchAllQuotes_quotesResponse');
        if (quotesListSuccessResponse !== null && quotesListSuccessResponse !== undefined &&
          quotesListSuccessResponse['items'].length > 0) {
          this.model.items = [...quotesListSuccessResponse.items];
          this.model.startIndex = quotesListSuccessResponse.startIndex;
          this.model.pageSize = quotesListSuccessResponse.pageSize;
          this.model.pageCount = quotesListSuccessResponse.pageCount;
          this.model.totalCount = quotesListSuccessResponse.totalCount;
        }
        this._spinner.stop();
      }, (quotesListErrResponse) => {
        this._spinner.stop();
        this._loggerService.info('QuotesListComponent : _quotesListService.fetchAllQuotes_errResponse');
        throw new HttpError(ErrorCode.QuoteListGetFailed, ErroNotificationType.Toaster);
      });
  }

  onColReorder(event) {
    this.selectedGridColumnHeader = event.columns;
    localStorage.setItem(Constants.localStorageKeys.quoteGridData, '{"columnHeader" : ' + JSON.stringify(this.selectedGridColumnHeader)
      + (this.model.sortField ? ', "sortField" : "' + this.model.sortField + '"' : '')
      + (this.model.sortOrder ? ',  "sortOrder" : "' + this.model.sortOrder + '"' : '')
      + ' }');
  }

  toggledGridColumn(gridColumnHeader) {
    this.selectedGridColumnHeader = gridColumnHeader;
    localStorage.setItem(Constants.localStorageKeys.quoteGridData, '{"columnHeader" : ' + JSON.stringify(this.selectedGridColumnHeader)
      + (this.model.sortField ? ', "sortField" : "' + this.model.sortField + '"' : '')
      + (this.model.sortOrder ? ',  "sortOrder" : "' + this.model.sortOrder + '"' : '')
      + ' }');
  }

  getQuoteGridData(model: any, col: any): any {
    let transformedValue: any;
    const fieldName = col.field;
    if (fieldName === 'auditInfo.createDate' || fieldName === 'auditInfo.updateDate') {
      const colProperties: string[] = fieldName.split('.');
      colProperties.forEach((prop, index) => {
        transformedValue = (index === 0 ? model[prop] : this.datePipe.transform(transformedValue[prop], Constants.dateFormat));
      });
    } else if (fieldName === 'auditInfo.createBy') {
      const colProperties: string[] = fieldName.split('.');
      colProperties.forEach((prop, index) => {
        transformedValue = (index === 0 ? model[prop] : transformedValue[prop]);
      });
    } else if (fieldName === 'expirationDate' || fieldName === 'submitDate') {
      transformedValue = this.datePipe.transform(model[fieldName], Constants.dateFormat);
    } else if (fieldName === 'shippingTaxTotal' || fieldName === 'total') {
      this._translate.get('SHARED.currencyCode')
        .subscribe((successResponse) => {
          transformedValue = this.currencyPipe.transform(model[fieldName], successResponse);
        });
    } else if (fieldName === 'totalQuantity') {
      transformedValue = model.items.reduce((sum, item) => sum + item.quantity, 0);
    } else if (fieldName === 'numberOfProducts') {
      transformedValue = model.items.length;
    } else {
      transformedValue = model[fieldName];
    }

    return transformedValue;
  }

  ngOnDestroy() {
    this._loggerService.info('QuotesListComponent : ngOnDestroy');
    this.model.subscriptions.forEach((s) => {
      s.unsubscribe();
    });
  }

  loadQuoteLazy(event: LazyLoadEvent) {
    this._loggerService.info('QuotesListComponent : loadQuoteLazy');
    if (event.sortField) {
      const sortOrder = event.sortOrder === 1 ? Constants.queryParameters.sortableOrder.ASC : Constants.queryParameters.sortableOrder.DESC;
      this.model.sortResult = this._utilityService.stringFormat('[{"property":"{{propertyName}}","sortOrder":"{{sortOrder}}"}]',
        { propertyName: event.sortField, sortOrder: sortOrder });
      this.model.sortField = event.sortField;
      this.model.sortOrder = sortOrder;
      localStorage.setItem(Constants.localStorageKeys.quoteGridData, '{"columnHeader" : ' + JSON.stringify(this.selectedGridColumnHeader)
        + (this.model.sortField ? ', "sortField" : "' + this.model.sortField + '"' : '')
        + (this.model.sortOrder ? ',  "sortOrder" : "' + this.model.sortOrder + '"' : '')
        + ' }');
    } else if (this.model.sortField !== undefined && this.model.sortOrder !== undefined) {
      this.model.sortResult = this._utilityService.stringFormat('[{"property":"{{propertyName}}","sortOrder":"{{sortOrder}}"}]',
        { propertyName: this.model.sortField, sortOrder: this.model.sortOrder });
    }
    this.model.startIndex = event.first;
    this.model.pageSize = event.rows;
    this.populateQuoteGrid(this.model.advancedSearch, this.model.startIndex, this.model.pageSize, this.model.sortResult);
  }

  refreshQuoteGrid(state: any) {
    this._loggerService.info('QuotesListComponent : refreshQuoteGrid');
    this.model.startIndex = state.first;
    this.model.pageSize = state.rows;
    if (localStorage.getItem(Constants.localStorageKeys.quoteGridData) != null) {
      const gridStateValue = JSON.parse(localStorage.getItem(Constants.localStorageKeys.quoteGridData));
      this.gridColumnHeader = gridStateValue['columnHeader'];
      this.model.sortField = gridStateValue['sortField'];
      this.model.sortOrder = gridStateValue['sortOrder'];
    }
    this.model.subscriptions.push(
      this._notificationService.quoteSearched.subscribe((advancedSearch: string) => {
        this.model.advancedSearch = advancedSearch;
      })
    );
    this.populateQuoteGrid(this.model.advancedSearch, this.model.startIndex, this.model.pageSize, this.model.sortResult);
  }

}
