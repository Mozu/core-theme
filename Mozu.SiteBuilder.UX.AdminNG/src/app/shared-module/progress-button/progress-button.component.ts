import {
    Component,
    Input,
    OnDestroy,
    OnInit,
    Output,
    EventEmitter,
    OnChanges,
    SimpleChange
} from '@angular/core';

import {
    LoggerService
} from '@core';
import { ProgressButtonService } from './progress-button.service';



@Component({
    moduleId: module.id,
    selector: 'progress-button',
    templateUrl: './progress-button.component.html',
    styleUrls: ['./progress-button.component.css']
})
export class ProgressButtonComponent implements OnInit, OnDestroy {

    @Input() label: string;
    @Output() buttonClick = new EventEmitter<any>();

    public isloading: boolean;
    public subscriptions: any[];

    public constructor (
            private _logger: LoggerService,
            private _progressButtonService: ProgressButtonService,
    ) {}

    ngOnInit(): void {
        this._logger.info('ProgressButtonComponent : ngOnInit');
        this.subscriptions = [];
        this.subscriptions.push(
            this._progressButtonService.status.subscribe((status: boolean) => {
                this._logger.info('ProgressButtonComponent : subscribe => Status ::--->>>>' + status);
                this.isloading = status;
            })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((s) => {
            s.unsubscribe();
        });
    }

    onClickbutton(event) {
        this.buttonClick.emit(event);
    }
}
