import { Component, OnInit, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { TreeNode } from 'primeng/components/common/api';
import { PhysicalLocationsService } from './locations.service';
import { LoggerService } from '@core';
import { ActivatedRoute } from '@angular/router';
import { Constants, NotificationLGActions } from '@shared/infrastructure';
import { NotificationService } from '@global';
import * as _ from 'lodash';

@Component({
  selector: 'physical-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.css'],
  providers: [PhysicalLocationsService],
  encapsulation: ViewEncapsulation.None,
  styles: [`
  
`]
})
export class PhysicalLocationsComponent implements OnInit {
  physicalLocations: TreeNode[];
  selectedPhysicalLocNode: TreeNode;
  @Output()
  physicalLocationSelected: EventEmitter<any> = new EventEmitter<any>();
  loading: boolean;
  cols: any[];
  mode: string;
  subscriptions = [];
  selectedLoctions = [];
  selectedLoctionsDetailsArr = [];


  constructor(private _loggerService: LoggerService,
    private _physicalLocationsService: PhysicalLocationsService,
    private _notificationService: NotificationService,
    private route: ActivatedRoute) { }

  ngOnInit() {

    this.mode = this.route.snapshot.data["mode"];
    if (this.mode === Constants.gridActionItem.New) {
      this.getPhysicalLocations();
    }
    else if (this.mode === Constants.gridActionItem.Edit) {
      this.subscriptions.push(
        this._notificationService.locationGroupEdited.subscribe((action: any) => {
          if (action && action.name === NotificationLGActions.editDataLoaded) {
            this.selectedLoctions = action.data;
            this.getPhysicalLocations();
          }
        })
      );
    }
    this.cols = [
      { field: 'name', header: '' }
    ];
  }

  ngOnDestroy() {
    this._loggerService.info("PhysicalLocationsComponent : ngOnDestroy");
    this.subscriptions.forEach((s) => {
        s.unsubscribe();
    });
  }

  private getPhysicalLocations() {
    this.loading = true;
    this._physicalLocationsService.getPhysicalLocations().subscribe(locations => {
      this.convertJsonToTreeNodeArr(locations);
      if (this.mode === Constants.gridActionItem.Edit) {
        //prepare selected location detials array :
        this.getSelectedLocationDetailsArr(locations);
        //send notification to main page.
        this._notificationService.notifyLocationGroupEdited({name:NotificationLGActions.selectedLocationWithDetails, data:this.selectedLoctionsDetailsArr});
      }
      this.loading = false;
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
        if (locations.items[locCnt].code === "US") {
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
    this.physicalLocations = treeNodeArr;
  };

  private getSelectedLocationDetailsArr(locations) {
    let selectedLocationsArr = [];
    if (locations && locations.items && this.selectedLoctions) {
      for (let selLocCnt = 0; selLocCnt < this.selectedLoctions.length; selLocCnt++) {
        for (let locCnt = 0; locCnt < locations.items.length; locCnt++) {
          if (locations.items[locCnt].states) {
            for (let stateCnt = 0; stateCnt < locations.items[locCnt].states.length; stateCnt++) {
              if (locations.items[locCnt].states[stateCnt].locations) {
                var locationObj = _.find(locations.items[locCnt].states[stateCnt].locations, { "code": this.selectedLoctions[selLocCnt] });
                if(locationObj){
                  this.selectedLoctionsDetailsArr.push(locationObj);
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
