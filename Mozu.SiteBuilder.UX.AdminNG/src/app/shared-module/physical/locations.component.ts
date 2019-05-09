import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import {TreeNode} from 'primeng/components/common/api';
import { PhysicalLocationsService } from './locations.service';
import { LoggerService } from '@core';


@Component({
  selector: 'physical-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.css'],
  providers:[PhysicalLocationsService]
})
export class PhysicalLocationsComponent implements OnInit {
  physicalLocations: TreeNode[];
  selectedPhysicalLocNode : TreeNode;
  @Output() onPhysicalLocationSelect: EventEmitter<any> = new EventEmitter<any>();

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
      //this.messageService.add({severity: 'info', summary: 'Node Selected', detail: event.node.data.name});
      this._loggerService.info("Node Selected"+ event.node.data.name);
      this.onPhysicalLocationSelect.emit(event.node.data);
  }

  nodeUnselect(event) {
    //this.messageService.add({severity: 'info', summary: 'Node Unselected', detail: event.node.data.name});
    this._loggerService.info("Node Unselected"+ event.node.data.name);
  }
}
