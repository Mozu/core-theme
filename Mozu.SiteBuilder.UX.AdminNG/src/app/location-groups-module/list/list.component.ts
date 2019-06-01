import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { LoggerService,
         HttpError, 
         ErrorCode, 
         ErroNotificationType } from '@core'

import { Constants, NotificationLGActions } from '@shared';
import { TranslateService } from '@ngx-translate/core';
import { LocationGroupListModel } from './list.model';
import { LocationGroupsListService } from './list.service';
import { NotificationService } from '@global';
import * as _ from 'lodash';

@Component({
    selector: 'location-group-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
    providers: [LocationGroupsListService]
})
export class LocationGroupsListComponent implements OnInit {
    public model: LocationGroupListModel;

    constructor(
        private _loggerService: LoggerService,
        private _locationGroupsListService: LocationGroupsListService,
        private _translate: TranslateService,
        private _notificationService: NotificationService,
        private router: Router) { }

    ngOnInit() {
        this._loggerService.info("LocationGroupsListComponent : ngOnInit");
        this.model = new LocationGroupListModel();
        this.model.numberOfRows = Constants.numberOfRows;
        this.model.items = [];
        this.model.locationGridContextMenuItem = [];

        this._translate.get('LOCATIONGROUP.GridContextMenu').subscribe((successResponse) => {
            this.gridContextMenu(successResponse);
        });

        this.populateLocationGroupGrid();
    }

    public gridContextMenu = (contextMenu) => {
        this.model.locationGridContextMenuItem.push({ label: contextMenu.edit, command: (event) => this.viewLocationGroup() })
        this.model.locationGridContextMenuItem.push({ label: contextMenu.delete, command: (event) => this.deleteLocationGroup() })
    }

    onRowSelect(event) {
        this.model.selectedLocationGroup = event.data;
    };
    
    deleteLocationGroup(){
        let locationGroupId = this.model.selectedLocationGroup.locationGroupId;
        this._locationGroupsListService.deleteLocationGroup(locationGroupId).subscribe((successResponse: Response) => {
            this._loggerService.info("LocationGroupsListComponent : _locationGroupsListService.deleteLocationGroup_successResponse");
            this.populateLocationGroupGrid();
            
        }, (errResponse) => {
            this._loggerService.info("LocationGroupsListComponent : _locationGroupsListService.deleteLocationGroup_errResponse");
            throw new HttpError(ErrorCode.QuoteListGetFailed, ErroNotificationType.Toaster);
        });
    }

    viewLocationGroup() {
        let locationGroupId = this.model.selectedLocationGroup.locationGroupId;
        this.router.navigate(['/' + Constants.uiRoutes.locationGroupEdit + '/' + locationGroupId]);
        this._notificationService.notifyLocationGroupAdded(NotificationLGActions.edit);
    }

    public populateLocationGroupGrid = () => {

        this._loggerService.info("LocationGroupsListComponent : populateLocationGroupGrid");

        this._locationGroupsListService.fetchAllLocationGroups().subscribe((successResponse: Response) => {
            this._loggerService.info("LocationGroupsListComponent : _locationGroupsListService.fetchAllLocationGroups_successResponse");
            let responseJson = successResponse;
            if (responseJson != null && responseJson != undefined && responseJson['items'].length > 0) {
                this.model.items = _.sortBy(responseJson['items'],['locationGroupId']);
            }
        }, (errResponse) => {
            this._loggerService.info("LocationGroupsListComponent : _locationGroupsListService.fetchAllLocationGroups_errResponse");
            throw new HttpError(ErrorCode.QuoteListGetFailed, ErroNotificationType.Toaster);
        })
    }

}