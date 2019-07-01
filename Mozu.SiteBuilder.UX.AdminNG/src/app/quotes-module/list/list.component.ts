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

    this.gridColumnHeader = [
      { field: 'name', header: 'QUOTES.GridHeader.quoteName', display: 'table-cell' },
      { field: 'customerAccountId', header: 'QUOTES.GridHeader.accountName', display: 'table-cell' },
      { field: 'customerInteractionType', header: 'QUOTES.GridHeader.accountUser', display: 'none' },
      { field: 'id', header: 'QUOTES.GridHeader.quoteID', display: 'none' },
      { field: 'auditInfo.createDate', header: 'QUOTES.GridHeader.createDate', display: 'table-cell', type: this.datePipe },
      { field: 'auditInfo.createBy', header: 'QUOTES.GridHeader.createdBy', display: 'none' },
      { field: 'expirationDate', header: 'QUOTES.GridHeader.expirationDate', display: 'table-cell', type: this.datePipe },
      { field: 'status', header: 'QUOTES.GridHeader.status', display: 'table-cell', class: 'content-pill' },
      { field: 'expirationDate', header: 'QUOTES.GridHeader.submitDate', display: 'none', type: this.datePipe },
      { field: 'auditInfo.updateDate', header: 'QUOTES.GridHeader.updateDate', display: 'none', type: this.datePipe },
      { field: 'items.quantity', header: 'QUOTES.GridHeader.numProducts', display: 'none' },
      { field: 'name', header: 'QUOTES.GridHeader.totalQty', display: 'none' },
      { field: 'shippingTaxTotal', header: 'QUOTES.GridHeader.estimatedCharges', display: 'table-cell', type: this.currencyPipe },
      { field: 'number', header: 'QUOTES.GridHeader.orderTotal', display: 'table-cell', type: this.currencyPipe },
      { field: 'customerInteractionType', header: 'QUOTES.GridHeader.projectName', display: 'table-cell' }
    ];
    this.selectedGridColumnHeader = this.gridColumnHeader;

    this.populateQuoteGrid();

    this.GridColumnsOnOverlayPanel = [
      { name: 'QUOTES.GridHeader.quoteName', checked: true },
      { name: 'QUOTES.GridHeader.accountName', checked: true },
      { name: 'QUOTES.GridHeader.accountUser', checked: false },
      { name: 'QUOTES.GridHeader.quoteID', checked: false },
      { name: 'QUOTES.GridHeader.createDate', checked: true },
      { name: 'QUOTES.GridHeader.createdBy', checked: false },
      { name: 'QUOTES.GridHeader.expirationDate', checked: true },
      { name: 'QUOTES.GridHeader.status', checked: true },
      { name: 'QUOTES.GridHeader.submitDate', checked: false },
      { name: 'QUOTES.GridHeader.updateDate', checked: false },
      { name: 'QUOTES.GridHeader.numProducts', checked: false },
      { name: 'QUOTES.GridHeader.totalQty', checked: false },
      { name: 'QUOTES.GridHeader.estimatedCharges', checked: true },
      { name: 'QUOTES.GridHeader.orderTotal', checked: true },
      { name: 'QUOTES.GridHeader.projectName', checked: true }
    ];
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

  toggleGridColumns(event) {
    if (event.currentTarget.checked) {
      this.gridColumnHeader.find(column => column.header === event.currentTarget.value).display = 'table-cell';
    } else {
      this.gridColumnHeader.find(column => column.header === event.currentTarget.value).display = 'none';
    }
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
