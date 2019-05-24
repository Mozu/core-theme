import { Component, OnInit, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import {TreeNode} from 'primeng/components/common/api';
import { PhysicalLocationsService } from './locations.service';
import { LoggerService } from '@core';


@Component({
  selector: 'physical-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.css'],
  providers:[PhysicalLocationsService],
  encapsulation: ViewEncapsulation.None,
  styles: [`
  
`]
})
export class PhysicalLocationsComponent implements OnInit {
  physicalLocations: TreeNode[];
  selectedPhysicalLocNode : TreeNode;
  @Output() 
  physicalLocationSelected: EventEmitter<any> = new EventEmitter<any>();
  loading: boolean;
  cols: any[];
  constructor( private _loggerService: LoggerService,
    private _physicalLocationsService:PhysicalLocationsService) { }

  ngOnInit() {
        this.loading = true;
        this._physicalLocationsService.getPhysicalLocations().subscribe(locations => {
            this.convertJsonToTreeNodeArr(locations);
            this.loading = false;
        });
        
        this.cols = [
            { field: 'name', header: '' }
        ];
  }
  
  convertJsonToTreeNodeArr(locations){
    let treeNodeArr = [];
    if(locations && locations.items){
      for(let locCnt = 0; locCnt<locations.items.length; locCnt++){
          let treenodeObj = <TreeNode>new Object();
          treenodeObj.data = {};
          let totalLocationsCnt = 0;
         
          treenodeObj.data.code = locations.items[locCnt].code;
          if(locations.items[locCnt].code === "US"){
            treenodeObj.expanded = true;
          }
          if(locations.items[locCnt].states){
            treenodeObj.children = [];
            
            for(let stateCnt =0; stateCnt<locations.items[locCnt].states.length; stateCnt++){
              var stateTreeNodeObj = <TreeNode>new Object();
              stateTreeNodeObj.data = {};
              stateTreeNodeObj.data.code = locations.items[locCnt].states[stateCnt].code;
              if(locations.items[locCnt].states[stateCnt].locations){
                stateTreeNodeObj.data.name = locations.items[locCnt].states[stateCnt].name+" ("+locations.items[locCnt].states[stateCnt].locations.length+")";
                totalLocationsCnt += locations.items[locCnt].states[stateCnt].locations.length;
              }else{
                stateTreeNodeObj.data.name = locations.items[locCnt].states[stateCnt].name+" (0)";
              }
              stateTreeNodeObj.data.locations = locations.items[locCnt].states[stateCnt].locations;
              treenodeObj.children.push(stateTreeNodeObj);
            }
          }
          treenodeObj.data.name = locations.items[locCnt].name+" ("+totalLocationsCnt+")";
          treeNodeArr.push(treenodeObj);
      }
    }
    this.physicalLocations = treeNodeArr;
  };

  nodeSelect(event) {
      this._loggerService.info("Node Selected"+ event.node.data.name);
      this.physicalLocationSelected.emit(event.node.data);
  }

  nodeUnselect(event) {
    this._loggerService.info("Node Unselected"+ event.node.data.name);
  }
}
