import {
    Component,
    OnInit
} from '@angular/core';

import { LoggerService } from '@core';
import { SharedDataService, CtUser } from '@global';
import { MenuItem } from 'primeng/api';
import { HeaderService } from './header.service';


@Component({
    moduleId: module.id,
    selector: 'header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    providers: [HeaderService]
})
export class HeaderComponent implements OnInit {
    public tenantName: string;
    public loggedInUserName : string;
    public userNameInitials : string;
    public menuItem : MenuItem;

    constructor(
        private _loggerService : LoggerService,
        private _sharedData : SharedDataService,
        private headerService: HeaderService
    ) {
        this._loggerService.info("HeaderComponent : constructor");
    }

    ngOnInit() {
        this._loggerService.info("HeaderComponent : constructor");
        this.fetchloggedInUserData();
        this.fetchRedirectionLink();
    }

    public fetchloggedInUserData = () => {
        this.loggedInUserName = this._sharedData._sharedData.items.ctUser.firstName +' '+ this._sharedData._sharedData.items.ctUser.lastName; 
        this.userNameInitials = this._sharedData._sharedData.items.ctUser.firstName.charAt(0) + this._sharedData._sharedData.items.ctUser.lastName.charAt(0);
        this.tenantName = this._sharedData._sharedData.items.ctTaContext.name;
    }

    public fetchRedirectionLink = () => {
        this.headerService.fetchRedirectionLinks().subscribe( data => this.menuItem = data );
      }
}
