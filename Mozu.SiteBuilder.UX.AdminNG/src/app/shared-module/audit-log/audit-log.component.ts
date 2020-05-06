import { Component,
         OnInit,
         Input,
         SimpleChanges,
         OnChanges } from '@angular/core';

import { LoggerService,
         ErrorCode,
         HttpError,
          ErroNotificationType } from '@core';

import { AuditLogModel,
         AuditLogService } from './index';

@Component({
  selector: 'audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.css'],
  providers: [AuditLogService]
})

export class AuditLogComponent implements OnChanges, OnInit {
  public model: AuditLogModel;
  @Input('QuoteId') quoteId: string;

  constructor(private _auditLogService: AuditLogService,
    private _loggerService: LoggerService) { }

  ngOnChanges(changes: SimpleChanges) {
    this._loggerService.info('AuditLogComponent : ngOnChanges');
    this.quoteId = changes['quoteId'].currentValue;
    if (this.quoteId !== undefined) {
      this.populateAuditLog(this.quoteId);
    }
  }

  ngOnInit() {
    this.model = new AuditLogModel();
    this.model.items = [];
  }

  public populateAuditLog = (quoteId: string) => {
    this._loggerService.info('AuditLogComponent : populateAuditLog');

    this._auditLogService.fetchAuditLog().subscribe((auditLogSuccessResponse: any) => {
      this._loggerService.info('AuditLogComponent : _auditLogService.fetchAuditLog_auditLogSuccessResponse');
      if (auditLogSuccessResponse != null && auditLogSuccessResponse !== undefined && auditLogSuccessResponse['items'].length > 0) {
        this.model = auditLogSuccessResponse;
      }
    }, (errResponse) => {
      this._loggerService.info('AuditLogComponent : _auditLogService.fetchAuditLog_errResponse');
      throw new HttpError(ErrorCode.QuoteListGetFailed, ErroNotificationType.Toaster);
    });
  }

}
