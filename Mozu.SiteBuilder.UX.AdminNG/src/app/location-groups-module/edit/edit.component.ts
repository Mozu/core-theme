import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EditLocationGroupService } from './edit.service';
import { LoggerService } from '@core';
import { SharedDataService } from '@global';
import { FormControl, FormGroup, Validators, FormArray, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LocationGroupModel } from '../create/location.group.model';
import { TreeNode, SelectItem, MessageService } from 'primeng/components/common/api';
import { LocationsListModel } from '@shared';



@Component({
  selector: 'location-group-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
  providers: [EditLocationGroupService]
})
export class LocationGroupEditComponent implements OnInit {

  sitesLst: any[];
  locationGroupForm: FormGroup;
  locationGroupId: string;


  physicalLocation: TreeNode;
  selectedLocations: LocationsListModel[];

  @ViewChild('stickyMenu') menuElement: ElementRef;
  menuPosition: any;
  sticky: boolean = false;

  isSaving: boolean;
  subscriptions = [];

  constructor(
    private _loggerService: LoggerService,
    private _sharedData: SharedDataService,
    private _editLocationGroupService: EditLocationGroupService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this._loggerService.info("LocationGroupEditComponent : ngOnInit");
    

    this.locationGroupForm = this.fb.group({
      locationGroupName: ['', [Validators.required, Validators.maxLength(50)]],
      locationSites: new FormArray([])
    });

    this.fetchSitesData();

    this.locationGroupId = this.route.snapshot.paramMap.get("id");
    
    this._editLocationGroupService.getLocationGroup(this.locationGroupId).subscribe(
      (response) => this.onGetLocationGroupSuccess(response),
      (response) => this.onGetLocationGroupError(response.error.message)
    );
  }

  private onGetLocationGroupSuccess(result) {
    this._loggerService.info("LocationGroupEditComponent : onSaveSuccess"+JSON.stringify(result));
  }

  private onGetLocationGroupError(errmsg: string) {
    this._loggerService.info("LocationGroupEditComponent : onSaveError");
  }
  
  public fetchSitesData = () => {
    this._loggerService.info("LocationGroupCreateComponent : fetchSitesData");
    if (this._sharedData._sharedData.items.ctTenant.sites) {
      this.sitesLst = this._sharedData._sharedData.items.ctTenant.sites;
      this.addCheckboxes();
    }
  }

  private addCheckboxes() {
    this.sitesLst.map((o, i) => {
      const control = new FormControl(false); // if first item set to true, else false
      (this.locationGroupForm.controls.locationSites as FormArray).push(control);
    });
  }


}
