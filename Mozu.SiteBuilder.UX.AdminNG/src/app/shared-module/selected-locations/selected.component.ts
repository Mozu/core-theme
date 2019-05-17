import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { LoggerService,HttpError, ErrorCode, ErroNotificationType } from '@core';
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
    virtualLocations: LocationsListModel[];
    selectedLocations: LocationsListModel[];
    @Input()
    selectedLocationsLst: LocationsListModel[];
    totalRecords: number;

    constructor(
        private _loggerService: LoggerService
    ){ 
    }

    ngOnInit() {
        this._loggerService.info("SelectedLocationsComponent : ngOnInit");
        this.cols = [
            { field: 'name', header: ''}
        ];
        this.totalRecords = 250000;
    }

    ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
        //this._loggerService.info("SelectedLocationsComponent : changes"+ JSON.stringify(changes));
        //this._loggerService.info("SelectedLocationsComponent : changes"+ JSON.stringify(changes.physicalLocation.currentValue));
        if(changes.selectedLocationsLst && changes.selectedLocationsLst.currentValue){
            this.virtualLocations = [...<any>changes.selectedLocationsLst.currentValue];
            this.selectedLocations = [...<any>changes.selectedLocationsLst.currentValue];
        }
    }
}