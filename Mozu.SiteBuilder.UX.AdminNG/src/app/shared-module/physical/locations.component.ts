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

  cols: any[];
  constructor( private _loggerService: LoggerService,
    private _physicalLocationsService:PhysicalLocationsService) { }

  ngOnInit() {
        this._physicalLocationsService.getPhysicalLocations().subscribe(locations => {
            this.physicalLocations = <TreeNode[]>(locations as any).data}
        );
        this.cols = [
            { field: 'name', header: '' }
        ];
  }

  nodeSelect(event) {
      this._loggerService.info("Node Selected"+ event.node.data.name);
      this.physicalLocationSelected.emit(event.node.data);
  }

  nodeUnselect(event) {
    this._loggerService.info("Node Unselected"+ event.node.data.name);
  }
}
