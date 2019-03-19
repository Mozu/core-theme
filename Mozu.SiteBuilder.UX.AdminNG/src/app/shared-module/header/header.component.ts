import {
    Component,
    OnInit
} from '@angular/core';

import { LoggerService } from '@core';


@Component({
    moduleId: module.id,
    selector: 'header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
    public tenantName: string;

    constructor(
        private _loggerService : LoggerService
    ) {
        this._loggerService.info("HeaderComponent : constructor");
    }

    ngOnInit() {
        this._loggerService.info("HeaderComponent : constructor");
        this.tenantName = "Decathlon Sandbox";
    }
}
