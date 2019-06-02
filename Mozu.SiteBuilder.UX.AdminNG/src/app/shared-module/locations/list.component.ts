import { Component, OnInit, Input, OnChanges, SimpleChange, EventEmitter, Output, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { LoggerService,HttpError, ErrorCode, ErroNotificationType } from '@core';
import { LazyLoadEvent } from 'primeng/api';
import { LocationsListModel } from './list.model';
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

    physicalLocationName : string;
    virtualLocations: LocationsListModel[];
    cols: any[];
    totalRecords: number;
    loading: boolean;
    inmemoryData: LocationsListModel[];
    selectedLocations: LocationsListModel[];

    stateName : string;
    setSelectedLocLst : LocationsListModel[];

    
    @Output() 
    locationSelected: EventEmitter<any> = new EventEmitter<any>();
    @Output() 
    locationUnselected: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    locationsChanged:EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('dt') turboTable: Table;
        
    constructor(
        private _loggerService: LoggerService, config: NgbTooltipConfig
    ){ 
        config.placement = 'left';
        config.triggers = 'hover';
    }

    ngOnInit() {
        this._loggerService.info("LocationsListComponent : ngOnInit");
        this.cols = [
            { field: 'name', header: '', filterMatchMode:'contains'}
        ];
        this.totalRecords = 250000;
        this.loading = true;
    }

    ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
        if(changes && changes.physicalLocation && changes.physicalLocation.currentValue){
            //reset filter.
            if(this.turboTable.filters['name'] && this.turboTable.filters['name'].value){
                this.turboTable.filters['name'].value = "";
            }
            this.getLocations(changes.physicalLocation.currentValue.locations, this.setSelectedLocLst);
            
        }
        if(changes && changes.selectedLocationsLst && changes.selectedLocationsLst.currentValue){
            this.setSelectedLocLst = changes.selectedLocationsLst.currentValue;
        }
    }
    
    getLocations(locations, selectedLocLst){
        if(locations){
            this.selectedLocations = [];
            this.virtualLocations = <any>locations;
            //set selected location 
            this.selectedLocations =  _.intersectionWith(this.virtualLocations, selectedLocLst, _.isEqual);
        }
    }
            
    rowSelected(event) {
        this._loggerService.info("Selected row is :::");
        this.locationSelected.emit(event.data);
    }

    rowUnselected(event) {
        this._loggerService.info("Unselected row is :::");
        this.locationUnselected.emit(event.data);
    }

    tableHeaderCheckboxToggle(event: any) {
        this._loggerService.info("onTableHeaderCheckboxToggle row is :::"+event.checked);
        if(event.checked === true){
            if(this.turboTable.filters['name'] && this.turboTable.filters['name'].value){
                this.locationsChanged.emit({data: this.turboTable.filteredValue, operation:LocationGroupEventOperations.add});
            }else{
                this.locationsChanged.emit({data: this.virtualLocations, operation:LocationGroupEventOperations.add});
            }
        } else {
            if(this.turboTable.filters['name'] && this.turboTable.filters['name'].value){
                this.locationsChanged.emit({data: this.turboTable.filteredValue, operation:LocationGroupEventOperations.remove});
            }else{
                this.locationsChanged.emit({data: this.virtualLocations, operation:LocationGroupEventOperations.remove});
            }
        }
    }   
}