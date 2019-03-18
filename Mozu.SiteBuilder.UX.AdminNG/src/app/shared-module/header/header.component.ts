import {
    Component,
    OnInit,
    ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';

import { LoggerService } from '@core';

import {
    SharedDataService,
    NotificationService
} from '@global';

import {
    ConfigurationSettings,
    Constants
} from '../infrastructure/index';

import {
    HttpError,
    ErrorCode,
    ErroNotificationType,
    UtilityService,
    AuthService
} from '@core';

import { environment } from '@env';

@Component({
    moduleId: module.id,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
    public tenantName: string;

    constructor(
    ) {}

    ngOnInit() {
        this.tenantName = "RajeshDSandbox";
    }
}
