import {
    Component,
    OnInit,
    OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';

import {
    LoggerService,
    HttpError,
    ErrorCode,
    ErroNotificationType,
    SpinnerService
} from '@core';

import {
    Constants,
    NotificationLGActions,
    ConfirmationDialogService,
    ConfirmationDialogNotificationCode,
    ConfirmationDialogNotificationType
} from '@shared';

import { TranslateService } from '@ngx-translate/core';
import { LocationGroupListModel } from './list.model';
import { LocationGroupsListService } from './list.service';
import { NotificationService } from '@global';
import * as _ from 'lodash';
import { TopLocationGroupConfigModel } from '@shared/header/location-groups/header-location-groups.model';

@Component({
    selector: 'location-group-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
    providers: [LocationGroupsListService]
})

export class LocationGroupsListComponent implements OnInit, OnDestroy {
    public model: LocationGroupListModel;
    subscriptions = [];

    constructor(
        private _loggerService: LoggerService,
        private _locationGroupsListService: LocationGroupsListService,
        private _translate: TranslateService,
        private _notificationService: NotificationService,
        private router: Router,
        private _confirmationDialogService: ConfirmationDialogService,
        private _spinner: SpinnerService) { }

    ngOnInit() {
        this._spinner.start();
        this._loggerService.info('LocationGroupsListComponent : ngOnInit');
        this.model = new LocationGroupListModel();
        this.model.numberOfRows = Constants.numberOfRows;
        this.model.items = [];
        this.model.locationGridContextMenuItem = [];

        this._translate.get('LOCATIONGROUP.GridContextMenu').subscribe((successResponse) => {
            this.gridContextMenu(successResponse);
        });

        this.populateLocationGroupGrid();

        this.subscriptions.push(
            this._notificationService.locationGroupDeleted.subscribe((action: string) => {
                if (action === ConfirmationDialogNotificationCode.DeleteLocationGroup) {
                    this.deleteLocationGroup();
                }
            })
        );
    }

    ngOnDestroy() {
        this._loggerService.info('LocationGroupsListComponent : ngOnDestroy');
        this.subscriptions.forEach((s) => {
            s.unsubscribe();
        });
    }

    public gridContextMenu = (contextMenu) => {
        this.model.locationGridContextMenuItem.push({ label: contextMenu.edit, command: (event) => this.viewLocationGroup() });
        this.model.locationGridContextMenuItem.push({ label: contextMenu.delete, command: (event) => this.showDeleteConfirmationDialog() });
    }

    onRowSelect(event) {
        this.model.selectedLocationGroup = event.data;
        // open in edit mode
        if (event && event.originalEvent && event.originalEvent.target &&
            event.originalEvent.target.classList &&
            event.originalEvent.target.classList.value === Constants.classess.ellipsis) {
            // open action menu.
        } else {
            this.viewLocationGroup();
        }
    }

    showDeleteConfirmationDialog() {
        this._confirmationDialogService.openConfirmationDialog(ConfirmationDialogNotificationCode.DeleteLocationGroup,
            ConfirmationDialogNotificationType.Confirmation, this.model.selectedLocationGroup.name);
    }

    deleteLocationGroup() {
        const locationGroupCode = this.model.selectedLocationGroup.locationGroupCode;
        this._locationGroupsListService.deleteLocationGroup(locationGroupCode).subscribe((successResponse: Response) => {
            this._loggerService.info('LocationGroupsListComponent : _locationGroupsListService.deleteLocationGroup_successResponse');
            this.populateLocationGroupGrid();
        }, (errResponse) => {
            this._loggerService.info('LocationGroupsListComponent : _locationGroupsListService.deleteLocationGroup_errResponse');
            throw new HttpError(ErrorCode.LocationGroupsListGetFailed, ErroNotificationType.Toaster);
        });
    }

    viewLocationGroup() {
        const locationGroupCode = this.model.selectedLocationGroup.locationGroupCode;
        this.router.navigate(['/' + Constants.uiRoutes.locationGroupEdit + '/' + locationGroupCode]);
        const topLocationGroupConfigModel = new TopLocationGroupConfigModel();
        topLocationGroupConfigModel.locationGroupId = this.model.selectedLocationGroup.locationGroupId;
        topLocationGroupConfigModel.locationGroupName = locationGroupCode;
        topLocationGroupConfigModel.locationGroupName = this.model.selectedLocationGroup.name;
        this._notificationService.notifySetLocationGroupConfigData({name: NotificationLGActions.list, data: topLocationGroupConfigModel});
    }

    public populateLocationGroupGrid = () => {
        this._loggerService.info('LocationGroupsListComponent : populateLocationGroupGrid');

        this._locationGroupsListService.fetchAllLocationGroups().subscribe((successResponse: Response) => {
            this._loggerService.info('LocationGroupsListComponent : _locationGroupsListService.fetchAllLocationGroups_successResponse');
            const responseJson = successResponse;
            if (responseJson != null && responseJson !== undefined && responseJson['items'].length > 0) {
                this.model.items = _.sortBy(responseJson['items'], ['locationGroupCode']);
            } else {
                this.model.items = [];
            }
            this._spinner.stop();
        }, (errResponse) => {
            this._spinner.stop();
            this._loggerService.info('LocationGroupsListComponent : _locationGroupsListService.fetchAllLocationGroups_errResponse');
            throw new HttpError(ErrorCode.LocationGroupsListGetFailed, ErroNotificationType.Toaster);
        });
    }
}
