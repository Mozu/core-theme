import { Component, OnInit, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { TreeNode } from 'primeng/components/common/api';
import { PhysicalLocationsService } from './locations.service';
import { LoggerService } from '@core';
import { ActivatedRoute } from '@angular/router';
import { Constants, NotificationLGActions } from '@shared/infrastructure';
import { NotificationService } from '@global';
import * as _ from 'lodash';
import { PhysicalLocationsModel } from './locations.model';
import { LocationListGridModel } from '@shared/locations';

@Component({
  selector: 'physical-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.css'],
  providers: [PhysicalLocationsService],
  encapsulation: ViewEncapsulation.None
})
export class PhysicalLocationsComponent implements OnInit {
  public model: PhysicalLocationsModel;
  @Output()
  physicalLocationSelected: EventEmitter<any> = new EventEmitter<any>();
  
  constructor(private _loggerService: LoggerService,
    private _physicalLocationsService: PhysicalLocationsService,
    private _notificationService: NotificationService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.model = new PhysicalLocationsModel();
    this.model.subscriptions = []; 
    this.model.formMode = this.route.snapshot.data["mode"];
    this.model.selectedLoctions = [];
    this.model.selectedLoctionsDetailsArr = [];

    if (this.model.formMode === Constants.gridActionItem.New) {
      this.getPhysicalLocations();
    }
    else if (this.model.formMode === Constants.gridActionItem.Edit) {
      this.model.subscriptions.push(
        this._notificationService.locationGroupEdited.subscribe((action: any) => {
          if (action && action.name === NotificationLGActions.editDataLoaded) {
            this.model.selectedLoctions = action.data;
            this.getPhysicalLocations();
          }
        })
      );
    }
    this.model.cols = [
      { field: 'name', header: '' }
    ];
  }

  ngOnDestroy() {
    this._loggerService.info("PhysicalLocationsComponent : ngOnDestroy");
    this.model.subscriptions.forEach((s) => {
        s.unsubscribe();
    });
  }

  private getPhysicalLocations() {
    this.model.isLoading = true;
    this._physicalLocationsService.getPhysicalLocations().subscribe(locations => {
      this.convertJsonToTreeNodeArr(locations);
      if (this.model.formMode === Constants.gridActionItem.Edit) {
        //prepare selected location detials array :
        this.getSelectedLocationDetailsArr(locations);
        //send notification to main page.
        this._notificationService.notifyLocationGroupEdited({name:NotificationLGActions.selectedLocationWithDetails, data:this.model.selectedLoctionsDetailsArr});
      }
      this.model.isLoading = false;
    });
  };
  convertJsonToTreeNodeArr(locations) {
    let treeNodeArr = [];
    if (locations && locations.items) {
      for (let locCnt = 0; locCnt < locations.items.length; locCnt++) {
        let treenodeObj = <TreeNode>new Object();
        treenodeObj.data = {};
        let totalLocationsCnt = 0;

        treenodeObj.data.code = locations.items[locCnt].code;
        if (locations.items[locCnt].code === Constants.locationGroupDefaultCountry) {
          treenodeObj.expanded = true;
        }
        if (locations.items[locCnt].states) {
          treenodeObj.children = [];

          for (let stateCnt = 0; stateCnt < locations.items[locCnt].states.length; stateCnt++) {
            var stateTreeNodeObj = <TreeNode>new Object();
            stateTreeNodeObj.data = {};
            stateTreeNodeObj.data.code = locations.items[locCnt].states[stateCnt].code;
            if (locations.items[locCnt].states[stateCnt].locations) {
              stateTreeNodeObj.data.name = locations.items[locCnt].states[stateCnt].name + " (" + locations.items[locCnt].states[stateCnt].locations.length + ")";
              totalLocationsCnt += locations.items[locCnt].states[stateCnt].locations.length;
            } else {
              stateTreeNodeObj.data.name = locations.items[locCnt].states[stateCnt].name + " (0)";
            }
            stateTreeNodeObj.data.locations = locations.items[locCnt].states[stateCnt].locations;
            treenodeObj.children.push(stateTreeNodeObj);
          }
        }
        treenodeObj.data.name = locations.items[locCnt].name + " (" + totalLocationsCnt + ")";
        treeNodeArr.push(treenodeObj);
      }
    }
    this.model.physicalLocations = treeNodeArr;
  };

  private getSelectedLocationDetailsArr(locations) {
    let selectedLocationsArr = [];
    if (locations && locations.items && this.model.selectedLoctions) {
      for (let selLocCnt = 0; selLocCnt < this.model.selectedLoctions.length; selLocCnt++) {
        for (let locCnt = 0; locCnt < locations.items.length; locCnt++) {
          if (locations.items[locCnt].states) {
            for (let stateCnt = 0; stateCnt < locations.items[locCnt].states.length; stateCnt++) {
              if (locations.items[locCnt].states[stateCnt].locations) {
                var locationObj = _.find(locations.items[locCnt].states[stateCnt].locations, { "code": this.model.selectedLoctions[selLocCnt] });
                if(locationObj){
                  this.model.selectedLoctionsDetailsArr.push(locationObj);
                }
              }
            }
          }
        }
      }
    }
  }

  nodeSelect(event) {
    this._loggerService.info("Node Selected" + event.node.data.name);
    this.physicalLocationSelected.emit(event.node.data);
  }

  nodeUnselect(event) {
    this._loggerService.info("Node Unselected" + event.node.data.name);
  }
}
