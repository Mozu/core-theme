import { Component, OnInit, Input, OnChanges, SimpleChange, EventEmitter, Output } from '@angular/core';
import { LoggerService,HttpError, ErrorCode, ErroNotificationType } from '@core';
import { LazyLoadEvent } from 'primeng/api';
import { LocationsListModel } from './list.model';
import { LocationsListService } from './list.service';
import {TreeNode} from 'primeng/components/common/api';
import * as _ from 'lodash';

@Component({
    selector: 'locations-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
    providers: [LocationsListService]
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
        
    constructor(
        private _loggerService: LoggerService,
        private _locationService:LocationsListService
    ){ 
    }

    ngOnInit() {
        this._loggerService.info("LocationsListComponent : ngOnInit");
        this.cols = [
            { field: 'name', header: ''}
        ];
        this.totalRecords = 250000;
        this.loading = true;
    }

    ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
        if(changes && changes.physicalLocation && changes.physicalLocation.currentValue){
            this.stateName = changes.physicalLocation.currentValue.name;
            this.getLocations(this.stateName, this.setSelectedLocLst);
        }
        if(changes && changes.selectedLocationsLst && changes.selectedLocationsLst.currentValue){
            this.setSelectedLocLst = changes.selectedLocationsLst.currentValue;
        }
    }
    
    

    getLocations(physicalLocationName, selectedLocLst){
        this.physicalLocationName = physicalLocationName;
        this._locationService.getLocations(physicalLocationName).subscribe(successResponse => {
            let responseJson = successResponse;
            this._loggerService.info("LocationsListComponent : _locationService.getLocations_successResponse");
            if(successResponse && (successResponse as any).items){
                this.selectedLocations = [];
                this.virtualLocations = <any>_.filter((successResponse as any).items, ['address.stateOrProvince', physicalLocationName]);
                //select selected location 
                this.selectedLocations =  _.intersectionWith(this.virtualLocations, selectedLocLst, _.isEqual);
            }
        }, 
        (errResponse) => {
            this._loggerService.info("LocationsListComponent : _locationService.getLocations_errResponse");;
            throw new HttpError(ErrorCode.LocationsGetFailed,ErroNotificationType.Toaster);
        });
    }

    loadDataOnScroll(event: LazyLoadEvent) {      
        this.loading = true;   
        setTimeout(() => {
            //last chunk
            if (event.first === 249980)
                this.virtualLocations = this.loadChunk(event.first, 20);
            else
                this.virtualLocations = this.loadChunk(event.first, event.rows);        
            this.loading = false;  
        }, 250);   
    }

    loadChunk(index, length): LocationsListModel[] {
        let chunk: LocationsListModel[] = [];
        for (let i = 0; i < length; i++) {
            chunk[i] = { "name": "Lazy Load Location "+(index + i), "code":(index + i), ...{vin: (index + i)}};
        } 
        return chunk;
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
            this.locationsChanged.emit({data: this.virtualLocations, operation:"add"});
        } else {
            this.locationsChanged.emit({data: this.virtualLocations, operation:"remove"});
        }
    }   
}