import { Component, OnInit, Inject, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { LoggerService } from '@core'
import { TreeNode, SelectItem } from 'primeng/components/common/api';
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
    providers: [CreateLocationGroupService]
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

    constructor(
        private _loggerService: LoggerService,
        private _sharedData: SharedDataService,
        private createService: CreateLocationGroupService,
        private _notificationService: NotificationService,
        private fb: FormBuilder,
        private router: Router) {

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
                else {
                    this.cancel();
                }
            })
        );
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
        el.scrollIntoView({behavior: 'smooth'});
        el.scrollIntoView(false);
        el.classList.add('divani');
        setTimeout(function() {
            el.classList.remove('divani');
          }, 4000);
    }

    scrollToLocationGrid(el: HTMLElement) {
        //https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
        //https://stackoverflow.com/questions/51618548/scrollintoview-is-not-working-does-not-taking-in-account-fixed-element
        //el.scrollIntoView({behavior: 'smooth', block: "end", inline: "nearest"});
        //behavior --One of "auto" or "smooth". Defaults to "auto".
        //block -- One of "start", "center", "end", or "nearest". Defaults to "start".
        //inline -- One of "start", "center", "end", or "nearest". Defaults to "nearest".
        el.scrollIntoView(false);
        el.scrollIntoView({behavior: 'smooth'});
        el.classList.add('divani');
        setTimeout(function() {
            el.classList.remove('divani');
          }, 4000);
    }


    save() {
        this._loggerService.info("LocationGroupCreateComponent : save"+JSON.stringify(this.locationGroupForm.value));
        this.isSaving = true;
        let lgModel: LocationGroupModel = new LocationGroupModel();
        this.createLocationGroups(lgModel);
        this.createService.addLocationGroup(lgModel).subscribe(response =>
            this.onSaveSuccess(response),
            () => this.onSaveError());
    }

    cancel() {
        this._loggerService.info("LocationGroupCreateComponent : cancel");
        this.router.navigate(['/' + Constants.uiRoutes.locationGroups]);
    }

    private createLocationGroups(lgModel: LocationGroupModel): void {
        if(this.locationGroupForm.value && this.locationGroupForm.value.locationSites){
            let sitesArr = this.locationGroupForm.value.locationSites.map((selected, i) => {
                return {
                  id: this.sitesLst[i].id,
                  selected : selected
               }
            });                
            sitesArr = _.filter(sitesArr, { selected: true});
            lgModel.siteIds = _.map(sitesArr, 'id');
        }
        lgModel.name = this.locationGroupForm.get(['locationGroupName']).value;
        lgModel.locationCodes = ['4TXmkoTLiA', 'CiCrK396LQ'];
    }

    private onSaveSuccess(result) {
        this._loggerService.info("LocationGroupCreateComponent : onSaveSuccess");
        this.isSaving = false;
        this.router.navigate(['/' + Constants.uiRoutes.locationGroups]);
    }

    private onSaveError() {
        this._loggerService.info("LocationGroupCreateComponent : onSaveError");
        this.isSaving = false;
        this.router.navigate(['/' + Constants.uiRoutes.locationGroups]);
    }
}