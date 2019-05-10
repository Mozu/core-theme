import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { LoggerService,HttpError, ErrorCode, ErroNotificationType } from '@core';
import { LazyLoadEvent } from 'primeng/api';
import {TreeNode} from 'primeng/components/common/api';
import * as _ from 'lodash';
import { LocationsListModel } from '@shared/locations';

@Component({
    selector: 'selected-locations-list',
    templateUrl: './selected.component.html',
    styleUrls: ['./selected.component.css'],
    providers: []
})
export class SelectedLocationsComponent implements OnInit, OnChanges {
    
    cols: any[];
    selectedLocations: LocationsListModel[];
    

    constructor(
        private _loggerService: LoggerService
    ){ 
    }

    ngOnInit() {
        this._loggerService.info("SelectedLocationsComponent : ngOnInit");
        this.cols = [
            { field: 'name', header: ''}
        ];
    }

    ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
        this._loggerService.info("SelectedLocationsComponent : changes"+ JSON.stringify(changes));
        //this._loggerService.info("SelectedLocationsComponent : changes"+ JSON.stringify(changes.physicalLocation.currentValue));
    }
    
}