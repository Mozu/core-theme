import { Component, OnInit, Input, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import { LoggerService } from '@core';
import * as _ from 'lodash';
import { LocationsListModel } from '@shared/locations';
import { SelectedLocationModel } from './selected.model';
import { LocationGroupEventOperations } from '@shared/infrastructure';


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
    @Output()
    locationUnselected: EventEmitter<any> = new EventEmitter<any>();
    @Output()
    locationsChanged: EventEmitter<any> = new EventEmitter<any>();

    // below properties not able to move to model level as used in ngOnChanges methods.
    selectedLocations: LocationsListModel[];
    virtualLocations: LocationsListModel[];

    constructor(
        private _loggerService: LoggerService
    ) {}

    ngOnInit() {
        this._loggerService.info('SelectedLocationsComponent : ngOnInit');
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
        this._loggerService.info('Unselected row is :::');
        _.pullAllWith(this.virtualLocations, [event.data], _.isEqual);
        this.locationUnselected.emit(event.data);
    }

    tableHeaderCheckboxToggle(event: any) {
        this._loggerService.info('onTableHeaderCheckboxToggle row is :::' + event.checked);

        if (event.checked === false) {
           this.locationsChanged.emit({data: this.virtualLocations, operation: LocationGroupEventOperations.remove});
        }
        this.virtualLocations = [];
    }
}
