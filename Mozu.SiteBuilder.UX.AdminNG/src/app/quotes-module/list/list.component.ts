import {
  Component,
  OnInit
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
  SpinnerService
} from '@core';

import { TranslateService } from '@ngx-translate/core';

import { Constants } from '@shared';

import { QuotesListService } from './list.service';

import { QuotesListModel } from './list.model';

import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'quotes-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  providers: [QuotesListService]
})
export class QuotesListComponent implements OnInit {
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
    private datePipe: DatePipe) { }

  ngOnInit() {
    this._loggerService.info('QuotesListComponent : ngOnInit');
    this.model = new QuotesListModel();
    this.model.numberOfRows = Constants.numberOfRows;
    this.model.items = [];
    this.model.quoteGridContextMenuItem = [];

    this._translate.get('QUOTES.GridContextMenu').subscribe((successResponse) => {
      this.gridContextMenu(successResponse);
    });


    if (JSON.parse(localStorage.getItem('QuoteGridData')) != null) {
      this.gridColumnHeader = JSON.parse(localStorage.getItem('QuoteGridData'));
    } else {
      this.gridColumnHeader = [
        { field: 'name', header: 'QUOTES.GridHeader.quoteName', checked: true },
        { field: 'accountName', header: 'QUOTES.GridHeader.accountName', checked: true },
        { field: 'accountUser', header: 'QUOTES.GridHeader.accountUser', checked: false },
        { field: 'quoteNumber', header: 'QUOTES.GridHeader.quoteID', checked: false },
        { field: 'auditInfo.createDate', header: 'QUOTES.GridHeader.createDate', checked: true },
        { field: 'auditInfo.createBy', header: 'QUOTES.GridHeader.createdBy', checked: false },
        { field: 'expirationDate', header: 'QUOTES.GridHeader.expirationDate', checked: true },
        { field: 'status', header: 'QUOTES.GridHeader.status', checked: true, class: 'content-pill' },
        { field: 'submitDate', header: 'QUOTES.GridHeader.submitDate', checked: false },
        { field: 'auditInfo.updateDate', header: 'QUOTES.GridHeader.updateDate', checked: false },
        { field: 'numberOfProducts', header: 'QUOTES.GridHeader.numProducts', checked: false },
        { field: 'totalQuantity', header: 'QUOTES.GridHeader.totalQty', checked: false },
        { field: 'shippingTaxTotal', header: 'QUOTES.GridHeader.estimatedCharges', checked: true },
        { field: 'total', header: 'QUOTES.GridHeader.orderTotal', checked: true },
        { field: 'projectName', header: 'QUOTES.GridHeader.projectName', checked: true }
      ];
    }
    this.selectedGridColumnHeader = this.gridColumnHeader;

    this.populateQuoteGrid();

  }

  onRowSelect(event) {
    this.model.selectedQuote = event.data;
  }

  public gridContextMenu = (contextMenu) => {
    this.model.quoteGridContextMenuItem.push({ label: contextMenu.edit, command: (event) => this.viewQuote() });
  }

  viewQuote() {
    const quoteId = this.model.selectedQuote.id;
    this.router.navigate(['/' + Constants.uiRoutes.quotesEdit + '/' + quoteId]);
  }

  public populateQuoteGrid = () => {
    this._spinner.start();
    this._loggerService.info('QuotesListComponent : populateQuoteGrid');
    this._quotesListService.fetchAllQuotes().subscribe((quotesListSuccessResponse: QuotesListModel) => {
      this._loggerService.info('QuotesListComponent : _quotesListService.fetchAllQuotes_quotesResponse');
      if (quotesListSuccessResponse !== null && quotesListSuccessResponse !== undefined &&
        quotesListSuccessResponse['items'].length > 0) {
        this.model.items = [...quotesListSuccessResponse.items];
        this.model.startIndex = quotesListSuccessResponse.startIndex;
        this.model.pageSize = quotesListSuccessResponse.pageSize;
        this.model.pageCount = quotesListSuccessResponse.pageCount;
        this.model.totalCount = quotesListSuccessResponse.totalCount;
        this._spinner.stop();
      }
    }, (quotesListErrResponse) => {
      this._spinner.stop();
      this._loggerService.info('QuotesListComponent : _quotesListService.fetchAllQuotes_errResponse');
      throw new HttpError(ErrorCode.QuoteListGetFailed, ErroNotificationType.Toaster);
    });
  }

  onColReorder(event) {
    this.selectedGridColumnHeader = event.columns;
    localStorage.setItem('QuoteGridData', JSON.stringify(this.selectedGridColumnHeader));
  }

  toggleGridColumns(event, col) {
    const index = this.selectedGridColumnHeader.findIndex((e) => e.header === col.header);
    if (index === -1) {
      this.selectedGridColumnHeader.push(col);
    } else {
      col.checked = event.currentTarget.checked;
      this.selectedGridColumnHeader[index] = col;
    }
    localStorage.setItem('QuoteGridData', JSON.stringify(this.selectedGridColumnHeader));
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
}
