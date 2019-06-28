import {
    Component,
    OnInit,
    OnDestroy,
    Input
} from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { LoggerService } from '@core';

import { NavigationContainerType } from '@shared/infrastructure/enums';

import { NavigationService } from './navigation.service';

@Component({
    moduleId: module.id,
    selector: 'navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.css'],
    providers: [NavigationService]
})
export class NavigationComponent implements OnInit, OnDestroy {

    subscriptions: Subscription[];
    cartCount: number;
    @Input() navigationContainerType: string;
    navigationType = NavigationContainerType;

    constructor(
        private _loggerService: LoggerService
    ) {
        this.subscriptions = [];
    }

    ngOnInit() {
        this._loggerService.info('NavigationComponent : ngOnInit ');
    }

    ngOnDestroy() {
        this._loggerService.info('NavigationComponent : ngOnDestroy ');
    }
}
