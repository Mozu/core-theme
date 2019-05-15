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
    @Input() physicalLocation: TreeNode;
    physicalLocationName : string;
    virtualLocations: LocationsListModel[];
    cols: any[];
    totalRecords: number;
    loading: boolean;
    inmemoryData: LocationsListModel[];
    selectedLocations: LocationsListModel[];
    
    @Output() 
    locationSelected: EventEmitter<any> = new EventEmitter<any>();
    @Output() 
    locationUnselected: EventEmitter<any> = new EventEmitter<any>();
    
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
        this._loggerService.info("LocationsListComponent : changes"+ JSON.stringify(changes));
        this._loggerService.info("LocationsListComponent : changes"+ JSON.stringify(changes.physicalLocation.currentValue));
        if(changes && changes.physicalLocation && changes.physicalLocation.currentValue){
            this.getLocations(changes.physicalLocation.currentValue.name);
        }
    }
     
    getLocations(physicalLocationName){
        this.physicalLocationName = physicalLocationName;
        this._locationService.getLocations(physicalLocationName).subscribe(successResponse => {
            let responseJson = successResponse;
            this._loggerService.info("LocationsListComponent : _locationService.getLocations_successResponse");
            if(successResponse && (successResponse as any).items){
                this.virtualLocations = <any>_.filter((successResponse as any).items, ['address.stateOrProvince', physicalLocationName]);
            }
        }, 
        (errResponse) => {
            this._loggerService.info("LocationsListComponent : _locationService.getLocations_errResponse");;
            throw new HttpError(ErrorCode.LocationsGetFailed,ErroNotificationType.Toaster);
        });
    }

    loadDataOnScroll(event: LazyLoadEvent) {      
        this.loading = true;   

        //for demo purposes keep loading the same dataset 
        //in a real production application, this data should come from server by building the query with LazyLoadEvent options 
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
        console.log("index ::"+index +  "  length:: "+length);
        console.log("this.virtualLocations ::",this.virtualLocations);
        for (let i = 0; i < length; i++) {
            chunk[i] = { "name": "Lazy Load Location "+(index + i), "code":(index + i), ...{vin: (index + i)}};
        } 
        console.log("chunk ::",chunk);
        return chunk;
    }

    onRowSelect(event) {
        this._loggerService.info("Selected row is :::"+ JSON.stringify(event.data));
        this.locationSelected.emit(event.data);
    }

    onRowUnselect(event) {
        this._loggerService.info("Unselected row is :::"+ JSON.stringify(event.data));
        this.locationUnselected.emit(event.data);
    }

    onHeaderClick(event) {
        this._loggerService.info("onHeaderClick row is :::"+ JSON.stringify(event));
    }   
}