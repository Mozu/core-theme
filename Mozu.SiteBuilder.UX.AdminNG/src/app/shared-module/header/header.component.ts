import {
    Component,
    OnInit
} from '@angular/core';

import { LoggerService } from '@core';
import { SharedDataService, CtUser } from '@global';


@Component({
    moduleId: module.id,
    selector: 'header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
    public tenantName: string;
    public loggedInUserName : string;
    public userNameInitials : string;

    constructor(
        private _loggerService : LoggerService,
        private _sharedData : SharedDataService
    ) {
        this._loggerService.info("HeaderComponent : constructor");
    }

    ngOnInit() {
        this._loggerService.info("HeaderComponent : constructor");
        this.fetchloggedInUserData();
    }

    public fetchloggedInUserData = () => {
        console.log(this._sharedData._sharedData);
        this.loggedInUserName = this._sharedData._sharedData.items.ctUser.firstName +' '+ this._sharedData._sharedData.items.ctUser.lastName; 
        this.userNameInitials = this._sharedData._sharedData.items.ctUser.firstName.charAt(0) + this._sharedData._sharedData.items.ctUser.lastName.charAt(0);
        this.tenantName = this._sharedData._sharedData.items.ctTaContext.name;
    }
}
