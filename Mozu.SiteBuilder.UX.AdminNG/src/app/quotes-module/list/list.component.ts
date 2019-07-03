import {
  Component,
  OnInit
} from '@angular/core';

import { Router } from '@angular/router';
import { CurrencyPipe,
  DatePipe } from '@angular/common';
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
  providers: [QuotesListService, CurrencyPipe, DatePipe]
})
export class QuotesListComponent implements OnInit  {
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

    this.gridColumnHeader = [
      { field: 'name', header: 'QUOTES.GridHeader.quoteName', checked: true },
      { field: 'accountName', header: 'QUOTES.GridHeader.accountName', checked: true },
      { field: 'accountUser', header: 'QUOTES.GridHeader.accountUser', checked: false },
      { field: 'id', header: 'QUOTES.GridHeader.quoteID', checked: false },
      { field: 'auditInfo.createDate', header: 'QUOTES.GridHeader.createDate', checked: true, type: this.datePipe },
      { field: 'auditInfo.createBy', header: 'QUOTES.GridHeader.createdBy', checked: false },
      { field: 'expirationDate', header: 'QUOTES.GridHeader.expirationDate', checked: true, type: this.datePipe },
      { field: 'status', header: 'QUOTES.GridHeader.status', checked: true, class: 'content-pill' },
      { field: 'submitDate', header: 'QUOTES.GridHeader.submitDate', checked: false, type: this.datePipe },
      { field: 'auditInfo.updateDate', header: 'QUOTES.GridHeader.updateDate', checked: false, type: this.datePipe },
      { field: 'items.quantity', header: 'QUOTES.GridHeader.numProducts', checked: false },
      { field: 'items.quantity', header: 'QUOTES.GridHeader.totalQty', checked: false },
      { field: 'shippingTaxTotal', header: 'QUOTES.GridHeader.estimatedCharges', checked: true, type: this.currencyPipe },
      { field: 'total', header: 'QUOTES.GridHeader.orderTotal', checked: true, type: this.currencyPipe },
      { field: 'projectName', header: 'QUOTES.GridHeader.projectName', checked: true }
    ];
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
    this._quotesListService.fetchAllQuotes().subscribe((quotesListSuccessResponse: Response) => {
      this._loggerService.info('QuotesListComponent : _quotesListService.fetchAllQuotes_quotesResponse');
      if (quotesListSuccessResponse !== null && quotesListSuccessResponse !== undefined &&
        quotesListSuccessResponse['items'].length > 0) {
        this.model.items = quotesListSuccessResponse['items'];
        this._spinner.stop();
      }
    }, (quotesListErrResponse) => {
      this._spinner.stop();
      this._loggerService.info('QuotesListComponent : _quotesListService.fetchAllQuotes_errResponse');
      throw new HttpError(ErrorCode.QuoteListGetFailed, ErroNotificationType.Toaster);
    });
  }

  toggleGridColumns(event, col) {
    col.checked = event.currentTarget.checked;
  }

  getQuoteGridData(model: any, col: any): any {
    const colProperties: string[] = col.field.split('.');
    let value: any = model;
    colProperties.forEach((prop, index) => {
      if (col.type) {
        switch (col.type) {
          case this.currencyPipe:
            value = colProperties.length > 1 ?
              (index === 0 ? value[prop] : col.type.transform(value[prop]))
              : col.type.transform(value[prop]);
            break;

          case this.datePipe:
            value = colProperties.length > 1 ?
              (index === 0 ? value[prop] : col.type.transform(value[prop], Constants.dateFormat))
              : col.type.transform(value[prop]);
            break;
          default:
            value = col.type.transform(value[prop]);
            break;
        }
      } else {
        value = value[prop];
      }
    });
    return value;
  }
}
