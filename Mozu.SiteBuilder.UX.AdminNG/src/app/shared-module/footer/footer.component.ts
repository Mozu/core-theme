import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';

import {
    UtilityService,
    LoggerService
} from '@core';

import { SharedDataService } from '@global';

import { FooterService } from './footer.service';

@Component({
    moduleId: module.id,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'footer',
    templateUrl: 'footer.component.html',
    providers: [FooterService]
})
export class FooterComponent implements OnInit {
    model = '';

    constructor(
        private _logger: LoggerService,
        private _utilityService: UtilityService,
        private _changeRef: ChangeDetectorRef,
        private _footerService: FooterService,
        private _sharedDataService: SharedDataService
    ) {
        this._logger.info('FooterComponent : constructor ');
    }

    ngOnInit() {
        this._logger.info('FooterComponent : ngOnInit');
    }

}
