import { Injectable } from '@angular/core';

import {
    NGXLogger,
    CustomNGXLoggerService,
    NgxLoggerLevel
 } from 'ngx-logger';

 @Injectable()
export class LoggerService {
    private _logger: NGXLogger;

    // TODO - drive the logger level via environments/environment config
    constructor(customLogger: CustomNGXLoggerService) {
      this._logger = customLogger.create({level: NgxLoggerLevel.ERROR});
    }

    // TODO - maintain array of last 100 log info messages
    info(message: string) {
        this._logger.info(message);
    }

    // TODO - append the message with last 100 log info messages
    // Note - logger.error to be called only when we want log to post to server
    error(message: string) {
        this._logger.error(message);
    }
}
