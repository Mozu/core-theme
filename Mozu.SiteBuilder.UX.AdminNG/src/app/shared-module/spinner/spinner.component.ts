import {
    Component,
    Input,
    OnDestroy,
    OnInit
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
export class SpinnerComponent implements OnInit, OnDestroy {


    public active: boolean;
    public subscriptions: any[];
    @Input() continerCssClass: string;

    public constructor
        (private _spinner: SpinnerService,
            private _logger: LoggerService
        ) { }

    ngOnInit(): void {
        this.subscriptions = [];
        this.subscriptions.push(
            this._spinner.status.subscribe((status: boolean) => {
                this._logger.info('SpinnerComponent : subscribe => Status : ' + status);
                this.active = status;
            })
        );
    }


    ngOnDestroy(): void {
        this.subscriptions.forEach((s) => {
            s.unsubscribe();
        });
    }
}
