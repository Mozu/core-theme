import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoggerService } from '@core'
import {TreeNode} from 'primeng/components/common/api';

@Component({
    selector: 'location-group-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.css'],
    providers: []
})
export class LocationGroupCreateComponent implements OnInit {
    physicalLocation : TreeNode;
    constructor(
        private _loggerService: LoggerService,
        private router: Router) { }

    ngOnInit() {
        this._loggerService.info("LocationGroupCreateComponent : ngOnInit");
    }
    
    onPhysicalLocationSelect(physicalLocation:TreeNode){
        this._loggerService.info("LocationGroupCreateComponent : onPhysicalLocationSelect"+ JSON.stringify(physicalLocation));
        this.physicalLocation = physicalLocation;
    }
}