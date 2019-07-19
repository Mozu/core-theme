import { Component,
         OnInit,
         Input,
         OnChanges,
         SimpleChange,
         EventEmitter,
         Output,
         ViewEncapsulation,
         ViewChild,
} from '@angular/core';

import { LoggerService } from '@core';
import { LocationsListModel, LocationListGridModel } from './list.model';
import {TreeNode} from 'primeng/components/common/api';
import {NgbTooltipConfig} from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { Table } from 'primeng/table';
import { LocationGroupEventOperations } from '@shared/infrastructure';

@Component({
    selector: 'locations-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
    providers: [NgbTooltipConfig],
    encapsulation: ViewEncapsulation.None
})
export class LocationsListComponent implements OnInit, OnChanges {
    @Input()
    physicalLocation: TreeNode;
    @Input()
    selectedLocationsLst: LocationsListModel[];
    @Output()
    locationSelected: EventEmitter<any> = new EventEmitter<any>();
    @Output()
    locationUnselected: EventEmitter<any> = new EventEmitter<any>();
    @Output()
    locationsChanged: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('dt') turboTable: Table;
    public model: LocationListGridModel;
    setSelectedLocLst: LocationsListModel[]; // can't set on model as used in ng on changes

    constructor(
        private _loggerService: LoggerService, config: NgbTooltipConfig
    ) {
        config.placement = 'left';
        config.triggers = 'hover';
    }

    ngOnInit() {
        this._loggerService.info('LocationsListComponent : ngOnInit');
        this.model = new LocationListGridModel();

        this.model.cols = [
            { field: 'name', header: '', filterMatchMode: 'contains'}
        ];
        this.model.totalRecords = 250000;
        this.model.isLoading = true;
    }

    ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
        if (changes && changes.physicalLocation && changes.physicalLocation.currentValue) {
            // reset filter.
            if (this.turboTable.filters['name'] && this.turboTable.filters['name'].value) {
                this.turboTable.filters['name'].value = '';
            }
            this.getLocations(changes.physicalLocation.currentValue.locations, this.setSelectedLocLst);
        }
        if (changes && changes.selectedLocationsLst && changes.selectedLocationsLst.currentValue) {
            this.setSelectedLocLst = changes.selectedLocationsLst.currentValue;
            this.updateGridCheckboxSelections();
        }
    }

    updateGridCheckboxSelections() {
       // unselect the removed items
       if (this.model) {
           this.model.selectedLocations = _.intersectionWith(this.model.selectedLocations,  this.setSelectedLocLst, _.isEqual);
       }
    }


    getLocations(locations, selectedLocLst) {
        if (locations) {
            this.model.selectedLocations = [];
            this.model.virtualLocations = <any>locations;
            this.model.selectedLocations = _.intersectionWith(this.model.virtualLocations, selectedLocLst, _.isEqual);
        }
    }

    rowSelected(event) {
        this.locationSelected.emit(event.data);
    }

    rowUnselected(event) {
        this.locationUnselected.emit(event.data);
    }

    tableHeaderCheckboxToggle(event: any) {
        if (event.checked === true) {
            if (this.turboTable.filters['name'] && this.turboTable.filters['name'].value) {
                this.locationsChanged.emit({data: this.turboTable.filteredValue, operation: LocationGroupEventOperations.add});
            } else {
                this.locationsChanged.emit({data: this.model.virtualLocations, operation: LocationGroupEventOperations.add});
            }
        } else {
            if (this.turboTable.filters['name'] && this.turboTable.filters['name'].value) {
                this.locationsChanged.emit({data: this.turboTable.filteredValue, operation: LocationGroupEventOperations.remove});
            } else {
                this.locationsChanged.emit({data: this.model.virtualLocations, operation: LocationGroupEventOperations.remove});
            }
        }
    }
}
