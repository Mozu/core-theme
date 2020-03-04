import { Component,
         OnInit,
         ViewChild,
         ElementRef,
         HostListener
} from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { LoggerService,
         TostrService,
         HttpError,
         ErrorCode,
         ErroNotificationType
} from '@core';
import { TreeNode } from 'primeng/components/common/api';
import { LocationsListModel,
         Constants,
         NotificationLGActions,
         LocationGroupEventOperations
} from '@shared';
import * as _ from 'lodash';
import { SharedDataService, NotificationService } from '@global';
import { CreateLocationGroupService } from './create.service';
import { LocationGroupModel, LocationGroupCreateModel } from './location.group.model';
import { FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { TopLocationGroupConfigModel } from '@shared/header/location-groups/header-location-groups.model';
import { ProgressButtonService } from '@shared/progress-button/progress-button.service';

@Component({
    selector: 'location-group-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.css'],
    providers: [CreateLocationGroupService],
})
export class LocationGroupCreateComponent implements OnInit {

    public model: LocationGroupCreateModel;
    @ViewChild('stickyMenu') menuElement: ElementRef;


    constructor(
        private _loggerService: LoggerService,
        private _sharedData: SharedDataService,
        private createService: CreateLocationGroupService,
        private _notificationService: NotificationService,
        private fb: FormBuilder,
        private _tostrService: TostrService,
        private router: Router,
        private route: ActivatedRoute,
        private _progressButtonService: ProgressButtonService,       
        private _translate: TranslateService) {

    }

    ngOnInit() {
        this.model = new LocationGroupCreateModel();
        this._loggerService.info('LocationGroupCreateComponent : ngOnInit');
        this.model.selectedLocations = [];
        this.model.isSticky = false;
        this.model.subscriptions = [];

        this.model.locationGroupForm = this.fb.group({
            locationGroupName: ['', [Validators.required, Validators.maxLength(50)]],
            locationGroupCode: ['', [Validators.required, Validators.maxLength(100)]],
            locationSites: new FormArray([])
        });

        this.fetchSitesData();
        this.model.subscriptions.push(
            this._notificationService.locationGroupAdded.subscribe((action: string) => {
                if (action === NotificationLGActions.save) {
                    if (this.model.formMode === Constants.gridActionItem.New) {
                        this.saveLocationGroup ();
                    } else if (this.model.formMode === Constants.gridActionItem.Edit) {
                        this.updateLocationGroup ();
                    }
                } else if (action === NotificationLGActions.cancel) {
                    this.cancelLocationGroup();
                }
            })
        );

        this.model.subscriptions.push(
            this._notificationService.locationGroupEdited.subscribe((action: any) => {
                if (action.name === NotificationLGActions.selectedLocationWithDetails) {
                   this.model.selectedLocations = action.data;
                }
            })
        );

        this.model.formMode = this.route.snapshot.data['mode'];
        if (this.model.formMode === Constants.gridActionItem.Edit) {
            this.model.locationGroupCode = this.route.snapshot.paramMap.get('locationGroupCode');
            this.model.subscriptions.push(
                this.createService.getLocationGroup(this.model.locationGroupCode).subscribe(
                    (response) => this.getLocationGroupSuccess(response),
                    (response) => this.getLocationGroupError(response.error.message)
                )
            );
        }
    }

    private getLocationGroupSuccess(result) {
        this._loggerService.info('LocationGroupCreateComponent : getLocationGroupSuccess' + JSON.stringify(result));
        if (result && result.items) {
            const lgModel: LocationGroupModel = <LocationGroupModel>result.items;
            this._notificationService.notifyLocationGroupEdited({name: NotificationLGActions.editDataLoaded, data: lgModel.locationCodes});
            this.updateLocationGroupForm(lgModel);

            // update the top header config object
            this.setConfigData(lgModel);
        }
    }

    private setConfigData(lgModel: LocationGroupModel) {
        const topLocationGroupConfigModel = new TopLocationGroupConfigModel();
        topLocationGroupConfigModel.locationGroupId = lgModel.locationGroupId;
        topLocationGroupConfigModel.locationGroupCode = lgModel.locationGroupCode;
        topLocationGroupConfigModel.locationGroupName = lgModel.name;
        topLocationGroupConfigModel.locationGroupSiteIds = lgModel.siteIds;
        this._notificationService.notifySetLocationGroupConfigData({name: NotificationLGActions.edit, data: topLocationGroupConfigModel});
    }

    private updateLocationGroupForm(lgModel: LocationGroupModel): void {
        const locationSites = [];
        this.model.sitesLst.map((o, i) => {
           const isSiteSelected =  _.indexOf(lgModel.siteIds, o.id);
           if (isSiteSelected !== -1) {
                locationSites.push(true);
           } else {
                locationSites.push(false);
           }
        });
        this.model.locationGroupForm.patchValue({
            locationGroupName: lgModel.name,
            locationGroupCode: lgModel.locationGroupCode,
            locationSites: locationSites
        });
    }

    private getLocationGroupError(errmsg: string) {
        this._loggerService.info('LocationGroupCreateComponent : getLocationGroupError');
        throw new HttpError(ErrorCode.GetLocationGroupDetailFailed, ErroNotificationType.Toaster);
    }

    private addSiteSelectionOptions () {
        this.model.sitesLst.map((o, i) => {
            const control = new FormControl(false);
            (this.model.locationGroupForm.controls.locationSites as FormArray).push(control);
        });
    }

    ngAfterViewInit() {
        this.model.menuPosition = this.menuElement.nativeElement.offsetTop;
    }

    ngOnDestroy() {
        this._loggerService.info('LocationGroupCreateComponent : ngOnDestroy');
        this.model.subscriptions.forEach((s) => {
            s.unsubscribe();
        });
    }

    public fetchSitesData = () => {
        this._loggerService.info('LocationGroupCreateComponent : fetchSitesData');
        if (this._sharedData._sharedData.items.ctTenant.sites) {
            this.model.sitesLst = this._sharedData._sharedData.items.ctTenant.sites;
            this.addSiteSelectionOptions();
        }
    }

    physicalLocationSelected(selectedPhysicalLocation: TreeNode) {
        this._loggerService.info('LocationGroupCreateComponent : physicalLocationSelected');
        this.model.selectedPhysicalLocation = selectedPhysicalLocation;
    }

    locationSelected(location: LocationsListModel) {
        this._loggerService.info('LocationGroupCreateComponent : locationSelected');
        const selectedLocationsArray = this.model.selectedLocations.slice();
        selectedLocationsArray.push(location);
        this.model.selectedLocations = selectedLocationsArray;
    }

    locationUnselected(location: LocationsListModel) {
        this._loggerService.info('LocationGroupCreateComponent : locationUnselected');
        this.model.selectedLocations = _.difference(this.model.selectedLocations, [location]);
    }

    locationsChanged(event) {
        this._loggerService.info('LocationGroupCreateComponent : locationsChanged');
        if (event.operation === LocationGroupEventOperations.add) {
            const changedLocationsArray = _.unionWith(this.model.selectedLocations, event.data, _.isEqual);
            this.model.selectedLocations = changedLocationsArray;
        } else {
            this.model.selectedLocations = _.differenceWith(this.model.selectedLocations, event.data, _.isEqual);
        }
    }

    @HostListener('scroll', ['$event'])
    scrollHandler(event) {
        const windowScroll = event.srcElement.scrollTop;
        if (windowScroll >= this.model.menuPosition) {
            this.model.isSticky = true;
        } else {
            this.model.isSticky = false;
        }
    }

    scrollToTop(el: HTMLElement) {
        el.scrollIntoView({ behavior: 'smooth' });
        el.scrollIntoView(false);
        el.classList.add('divani');
        setTimeout(function () {
            el.classList.remove('divani');
        }, 4000);
    }

    scrollToLocationGrid(el: HTMLElement) {
        el.scrollIntoView(false);
        el.scrollIntoView({ behavior: 'smooth' });
        el.classList.add('divani');
        setTimeout(function () {
            el.classList.remove('divani');
        }, 4000);
    }

    saveLocationGroup() {
        this._loggerService.info('LocationGroupCreateComponent : saveLocationGroup');
        const lgModel: LocationGroupModel = new LocationGroupModel();
        this.createLocationGroup(lgModel);
        if (this.validateLocationGroup(lgModel)) {
            this.model.isSaving = true;
            this._progressButtonService.start();
            this.createService.addLocationGroup(lgModel).subscribe(response =>
                this.onSaveSuccess(response),
                (response) => this.onSaveError(response.error.message));
        }
    }

    updateLocationGroup() {
        this._loggerService.info('LocationGroupCreateComponent : updateLocationGroup');
        const lgModel: LocationGroupModel = new LocationGroupModel();
        this.createLocationGroup(lgModel);
        if (this.validateLocationGroup(lgModel)) {
            this.model.isSaving = true;
            this._progressButtonService.start();
            this.createService.updateLocationGroup(lgModel).subscribe(response =>
                this.onSaveSuccess(response),
                (response) => this.onSaveError(response.error.message));
        }
    }

    cancelLocationGroup() {
        this._loggerService.info('LocationGroupCreateComponent : cancelLocationGroup');
        this.router.navigate(['/' + Constants.uiRoutes.locationGroups]);
        this._notificationService.notifyLocationGroupAdded(NotificationLGActions.cancelled);
    }

    private createLocationGroup(lgModel: LocationGroupModel): void {
        if (this.model.locationGroupForm.value && this.model.locationGroupForm.value.locationSites) {
            let sitesArr = this.model.locationGroupForm.value.locationSites.map((selected, i) => {
                return {
                    id: this.model.sitesLst[i].id,
                    selected: selected
                };
            });
            sitesArr = _.filter(sitesArr, { selected: true });
            lgModel.siteIds = _.map(sitesArr, 'id');
        }
        lgModel.name = this.model.locationGroupForm.get(['locationGroupName']).value;
        lgModel.locationGroupCode = this.model.locationGroupForm.get(['locationGroupCode']).value;
        lgModel.locationCodes = _.map(this.model.selectedLocations, 'code');
        if (this.model.locationGroupId) {
            lgModel.locationGroupId = this.model.locationGroupId;
        }
    }

    private validateLocationGroup(lgModel: LocationGroupModel): boolean {
        if (lgModel && _.isEmpty(lgModel.name)) {
            this._tostrService.showError(ErrorCode.EmptyLocationGroupName);
            return false;
        }
        if (lgModel && _.isEmpty(lgModel.locationGroupCode)) {
            this._tostrService.showError(ErrorCode.EmptyLocationGroupCode);
            return false;
        }
        if (lgModel && _.isEmpty(lgModel.siteIds)) {
            this._tostrService.showError(ErrorCode.EmptyLocationGroupSites);
            return false;
        }
        if (lgModel && _.isEmpty(lgModel.locationCodes)) {
            this._tostrService.showError(ErrorCode.EmptyLocationGroupCodes);
            return false;
        }
        return true;
    }

    private onSaveSuccess(result) {
        this._loggerService.info('LocationGroupCreateComponent : onSaveSuccess' + JSON.stringify(result));
        this.model.isSaving = false;
        this._progressButtonService.stop();
        this._notificationService.notifyLocationGroupAdded(NotificationLGActions.saved);
        // update the location config object.
        if (result && result.items) {
            const lgModel: LocationGroupModel =   <LocationGroupModel>result.items;
            this.setConfigData(lgModel);
            this.router.navigate(['/' + Constants.uiRoutes.locationGroupEdit + '/' + lgModel.locationGroupCode]);
        }
    }

    private onSaveError(errmsg: string) {
        this._loggerService.info('LocationGroupCreateComponent : onSaveError');
        this.model.isSaving = false;
        this._progressButtonService.stop();
        this._tostrService.showError(errmsg);
    }
}
