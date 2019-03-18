import {
    Component,
    Input
} from '@angular/core';

import {
    SpinnerService,
    LoggerService
} from '@core';

@Component({
    moduleId: module.id,
    selector: 'spinner',
    templateUrl: 'spinner.component.html'
})
export class SpinnerComponent {
    public active: boolean;
    @Input() continerCssClass: string;

    public constructor
        (_spinner: SpinnerService,
        private _logger: LoggerService
    ) {
        this._logger.info('SpinnerComponent : constructor');
        _spinner.status.subscribe((status: boolean) => {
            this._logger.info('SpinnerComponent : subscribe => Status : ' + status);
            this.active = status;
        });
    }
}
