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
        this.tenantName = this._sharedData._sharedData.items.ctTaContext.name;
    }

    public fetchRedirectionLink = () => {
         this._loggerService.info("HeaderComponent : fetchRedirectionLink");
        this._headerService.fetchRedirectionLinks().subscribe( data => this.userContextMenuItem = data );
      }
}
