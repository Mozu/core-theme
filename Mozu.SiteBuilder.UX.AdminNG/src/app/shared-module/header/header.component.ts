import {
    Component,
    OnInit
} from '@angular/core';

import { MenuItem } from 'primeng/api';
import { LoggerService } from '@core';
import { SharedDataService } from '@global';
import { HeaderModel } from './header.model';
import { HeaderService } from './header.service';



@Component({
    moduleId: module.id,
    selector: 'header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    providers: [HeaderService]
})
export class HeaderComponent implements OnInit {
    headerModel: HeaderModel;
    public userContextMenuItem : MenuItem;

    constructor(
        private _loggerService : LoggerService,
        private _sharedData : SharedDataService,
        private _headerService: HeaderService
    ) {
    }

    ngOnInit() {
        this.headerModel = new HeaderModel();
        this._loggerService.info("HeaderComponent : ngOnInit");
        this.fetchloggedInUserData();
        this.fetchRedirectionLink();
    }

    public fetchloggedInUserData = () => {
        this._loggerService.info("HeaderComponent : fetchloggedInUserData");
        this.headerModel.loggedInUserName = this._sharedData._sharedData.items.ctUser.firstName +' '+ this._sharedData._sharedData.items.ctUser.lastName; 
        this.headerModel.loggedInUserInitials = this._sharedData._sharedData.items.ctUser.firstName.charAt(0) + this._sharedData._sharedData.items.ctUser.lastName.charAt(0);
        this.headerModel.tenantName = this._sharedData._sharedData.items.ctTaContext.name;
    }

    public fetchRedirectionLink = () => {
        this._loggerService.info("HeaderComponent : fetchRedirectionLink");
        this._headerService.fetchRedirectionLinks().subscribe( eachLink => this.userContextMenuItem = eachLink );
      }
}
