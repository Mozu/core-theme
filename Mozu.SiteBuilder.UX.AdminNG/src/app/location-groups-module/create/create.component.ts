import { Component, OnInit, Inject, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoggerService, ToastrService } from '@core'
import { TreeNode, SelectItem, MessageService } from 'primeng/components/common/api';
import { LocationsListModel, Constants } from '@shared';
import * as _ from 'lodash';
import { SharedDataService, NotificationService } from '@global';
import { CreateLocationGroupService } from './create.service';
import { LocationGroupModel } from './location.group.model';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';

@Component({
    selector: 'location-group-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.css'],
    providers: [CreateLocationGroupService],
    //encapsulation: ViewEncapsulation.None
})
export class LocationGroupCreateComponent implements OnInit {
    physicalLocation: TreeNode;
    selectedLocations: LocationsListModel[];

    sitesLst: any[];
    sitesRows: any[];

    @ViewChild('stickyMenu') menuElement: ElementRef;
    menuPosition: any;
    sticky: boolean = false;

    isSaving: boolean;
    subscriptions = [];

    locationGroupForm: FormGroup;
    locationGroupId: string;
    mode: string;


    constructor(
        private _loggerService: LoggerService,
        private _sharedData: SharedDataService,
        private createService: CreateLocationGroupService,
        private _notificationService: NotificationService,
        private fb: FormBuilder,
        private _toastrService: ToastrService,
        private _messageService: MessageService,
        private router: Router,
        private route: ActivatedRoute) {

    }

    ngOnInit() {
        this._loggerService.info("LocationGroupCreateComponent : ngOnInit");
        this.selectedLocations = [];

        this.locationGroupForm = this.fb.group({
            locationGroupName: ['', [Validators.required, Validators.maxLength(50)]],
            locationSites: new FormArray([])
        });


        this.fetchSitesData();
        this.subscriptions.push(
            this._notificationService.addLocationGroup.subscribe((action: string) => {
                if (action === "Save") {
                    this.save();
                }
                else if (action === "Cancel") {
                    this.cancel();
                }
            })
        );

        this.subscriptions.push(
            this._notificationService.editLocationGroup.subscribe((action:any) => {
                if (action.name === "detailSelectedLocation") {
                   this.selectedLocations = action.data; 
                }
            })
        );

        this.locationGroupId = this.route.snapshot.paramMap.get("id");
        this.mode = this.route.snapshot.data["mode"];

        if(this.mode === Constants.gridActionItem.Edit) {
            this.createService.getLocationGroup(this.locationGroupId).subscribe(
                (response) => this.getLocationGroupSuccess(response),
                (response) => this.getLocationGroupError(response.error.message)
            );
        }
    }

    private getLocationGroupSuccess(result) {
        this._loggerService.info("LocationGroupCreateComponent : onSaveSuccess" + JSON.stringify(result));
        if(result && result.items){
            let lgModel : LocationGroupModel =   <LocationGroupModel>result.items;
            this._notificationService.notifyEditLocationGroup({name:"EditDataLoaded", data:lgModel.locationCodes});
            this.updateForm(lgModel);
        }
    }

    private updateForm(lgModel: LocationGroupModel): void {
        this.locationGroupForm.patchValue({
            locationGroupName: lgModel.name,
            locationSites: lgModel.siteIds
        });
    }

    private getLocationGroupError(errmsg: string) {
        this._loggerService.info("LocationGroupCreateComponent : onSaveError");
    }

    private addCheckboxes() {
        this.sitesLst.map((o, i) => {
            const control = new FormControl(false); // if first item set to true, else false
            (this.locationGroupForm.controls.locationSites as FormArray).push(control);
        });
    }

    ngAfterViewInit() {
        this.menuPosition = this.menuElement.nativeElement.offsetTop;
    }

    ngOnDestroy() {
        this._loggerService.info("LocationGroupCreateComponent : ngOnDestroy");
        this.subscriptions.forEach((s) => {
            s.unsubscribe();
        });
    }

    public fetchSitesData = () => {
        this._loggerService.info("LocationGroupCreateComponent : fetchSitesData");
        if (this._sharedData._sharedData.items.ctTenant.sites) {
            this.sitesLst = this._sharedData._sharedData.items.ctTenant.sites;
            this.addCheckboxes();
        }
    }

    physicalLocationSelected(physicalLocation: TreeNode) {
        this._loggerService.info("LocationGroupCreateComponent : physicalLocationSelected");
        this.physicalLocation = physicalLocation;
    }

    locationSelected(location: LocationsListModel) {
        this._loggerService.info("LocationGroupCreateComponent : locationSelected");
        let arr = this.selectedLocations.slice();
        arr.push(location);
        this.selectedLocations = arr;
    }

    locationUnselected(location: LocationsListModel) {
        this._loggerService.info("LocationGroupCreateComponent : locationUnselected");
        this.selectedLocations = _.difference(this.selectedLocations, [location]);
    }

    locationsChanged(event) {
        this._loggerService.info("LocationGroupCreateComponent : locationsChanged");
        if (event.operation === "add") {
            var arr = _.unionWith(this.selectedLocations, event.data, _.isEqual);
            this.selectedLocations = arr;
        }
        else {
            this.selectedLocations = _.differenceWith(this.selectedLocations, event.data, _.isEqual);
        }
    }

    @HostListener('scroll', ['$event'])
    scrollHandler(event) {
        let windowScroll = event.srcElement.scrollTop;
        if (windowScroll >= this.menuPosition) {
            this.sticky = true;
        } else {
            this.sticky = false;
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

    save() {
        this._loggerService.info("LocationGroupCreateComponent : save" + JSON.stringify(this.locationGroupForm.value));
        this.isSaving = true;
        let lgModel: LocationGroupModel = new LocationGroupModel();
        this.createLocationGroup(lgModel);
        if (this.validateLocationGroup(lgModel)) {
            this.createService.addLocationGroup(lgModel).subscribe(response =>
                this.onSaveSuccess(response),
                (response) => this.onSaveError(response.error.message));
        }
    }

    cancel() {
        this._loggerService.info("LocationGroupCreateComponent : cancel");
        this.router.navigate(['/' + Constants.uiRoutes.locationGroups]);
        this._notificationService.notifyAddLocationGroup("Cancel Success");
    }

    private createLocationGroup(lgModel: LocationGroupModel): void {
        if (this.locationGroupForm.value && this.locationGroupForm.value.locationSites) {
            let sitesArr = this.locationGroupForm.value.locationSites.map((selected, i) => {
                return {
                    id: this.sitesLst[i].id,
                    selected: selected
                }
            });
            sitesArr = _.filter(sitesArr, { selected: true });
            lgModel.siteIds = _.map(sitesArr, 'id');
        }
        lgModel.name = this.locationGroupForm.get(['locationGroupName']).value;
        lgModel.locationCodes = _.map(this.selectedLocations, 'code');
    }

    private validateLocationGroup(lgModel: LocationGroupModel): boolean {
        if (lgModel && _.isEmpty(lgModel.name)) {
            this._toastrService.showError("EmptyLocationGroupName");
            return false;
        }
        if (lgModel && _.isEmpty(lgModel.siteIds)) {
            this._toastrService.showError("EmptyLocationGroupSites");
            return false;
        }
        if (lgModel && _.isEmpty(lgModel.locationCodes)) {
            this._toastrService.showError("EmptyLocationGroupCodes");
            return false;
        }
        return true;
    }

    private onSaveSuccess(result) {
        this._loggerService.info("LocationGroupCreateComponent : onSaveSuccess");
        this.isSaving = false;
        this._notificationService.notifyAddLocationGroup("Save Success");
        this.router.navigate(['/' + Constants.uiRoutes.locationGroups]);

    }

    private onSaveError(errmsg: string) {
        this._loggerService.info("LocationGroupCreateComponent : onSaveError");
        this.isSaving = false;
        this._messageService.add({ severity: 'error', summary: 'Error Message', detail: errmsg });
    }
}