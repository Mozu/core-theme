import {
    Component,
    OnInit
} from '@angular/core';

import { MenuItem } from 'primeng/api';
import { LoggerService } from '@core';
import { SharedDataService } from '@global';
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
    public userFirstName : string;
    public userLastName : string;
    public userContextMenuItem : MenuItem;

    constructor(
        private _loggerService : LoggerService,
        private _sharedData : SharedDataService,
        private _headerService: HeaderService
    ) {
    }

    ngOnInit() {
        this._loggerService.info("HeaderComponent : ngOnInit");
        this.fetchloggedInUserData();
        this.fetchRedirectionLink();
    }

    public fetchloggedInUserData = () => {
        this._loggerService.info("HeaderComponent : fetchloggedInUserData");
        this.loggedInUserName = this._sharedData._sharedData.items.ctUser.firstName +' '+ this._sharedData._sharedData.items.ctUser.lastName; 
        this.userFirstName = this._sharedData._sharedData.items.ctUser.firstName;
        this.userLastName= this._sharedData._sharedData.items.ctUser.lastName;
        this.tenantName = this._sharedData._sharedData.items.ctTaContext.name;
    }

    public fetchRedirectionLink = () => {
        this._loggerService.info("HeaderComponent : fetchRedirectionLink");
        this._headerService.fetchRedirectionLinks().subscribe( eachLink => this.userContextMenuItem = eachLink );
      }
}
