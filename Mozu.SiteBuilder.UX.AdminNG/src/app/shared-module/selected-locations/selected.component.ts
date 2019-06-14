import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { LoggerService } from '@core';
import * as _ from 'lodash';
import { LocationsListModel } from '@shared/locations';
import { SelectedLocationModel } from './selected.model';

@Component({
    selector: 'selected-locations-list',
    templateUrl: './selected.component.html',
    styleUrls: ['./selected.component.css'],
    providers: []
})
export class SelectedLocationsComponent implements OnInit, OnChanges {

    public model: SelectedLocationModel;
    @Input()
    selectedLocationsLst: LocationsListModel[];
    //below properties not able to move to model level as used in ngOnChanges methods.
    selectedLocations: LocationsListModel[];
    virtualLocations: LocationsListModel[];

    constructor(
        private _loggerService: LoggerService
    ) {}

    ngOnInit() {
        this._loggerService.info("SelectedLocationsComponent : ngOnInit");
        this.model = new SelectedLocationModel();
        this.model.cols = [
            { field: 'name', header: '' }
        ];
        this.model.totalRecords = 250000;
    }

    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        if (changes.selectedLocationsLst && changes.selectedLocationsLst.currentValue) {
            this.virtualLocations = [...<any>changes.selectedLocationsLst.currentValue];
            this.selectedLocations = [...<any>changes.selectedLocationsLst.currentValue];
        }
    }

    rowUnselected(event) {
        this._loggerService.info("Unselected row is :::");
        _.pullAllWith(this.virtualLocations, [event.data], _.isEqual);
    }
}