import { Component } from '@angular/core';
import { LoggerService } from '../services/logger.service';

@Component({
    moduleId: module.id,
    selector: 'page-not-found',
    template: `<div class="empty-page">page not found</div>`
})
export class PageNotFoundComponent {

    constructor(
        private _logger: LoggerService
    ) {
        this._logger.info('PageNotFoundComponent : constructor ');
    }

}
