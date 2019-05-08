import { Component, OnInit } from '@angular/core';
import { LoggerService,HttpError, ErrorCode, ErroNotificationType } from '@core';
import { LazyLoadEvent } from 'primeng/api';
import { LocationModel } from './location.model';
//import { LocationService } from './location.service';

@Component({
    selector: 'locations-list',
    templateUrl: './locations.component.html',
    styleUrls: ['./locations.component.css'],
    providers: []
})
export class LocationsListComponent implements OnInit {
    
    virtualLocations: LocationModel[];
    cols: any[];
    totalRecords: number;
    loading: boolean;
    inmemoryData: LocationModel[];
    selectedLocations: LocationModel[];

    constructor(
        private _loggerService: LoggerService
        //private _locationService:LocationService
    ){ 
    }

    ngOnInit() {
        this._loggerService.info("LocationsListComponent : ngOnInit");
        this.cols = [
            { field: 'name', header: ''}
        ];
        this.totalRecords = 250000;
        this.loading = true;
        // this._locationService.getLocations().subscribe(successResponse => {
        //     let responseJson = successResponse;
        //     this._loggerService.info("LocationsListComponent : _locationService.getLocations_successResponse");
        //     if(successResponse && successResponse.items){
        //         this.inmemoryData = successResponse.items;
        //     }
        // }, 
        // (errResponse) => {
        //     this._loggerService.info("LocationsListComponent : _locationService.getLocations_errResponse");;
        //     throw new HttpError(ErrorCode.LocationsGetFailed,ErroNotificationType.Toaster);
        // });

        this.inmemoryData = [
            {"name": "VW", "code": "2012", "address": "Orange"},
            {"name": "Audi", "code": "2011", "address": "Black"},
            {"name": "Renault", "code": "2005", "address": "Gray"},
            {"name": "BMW", "code": "2003", "address": "Blue"},
            {"name": "Mercedes", "code": "1995", "address": "Orange"},
            {"name": "Volvo", "code": "2005", "address": "Black"},
            {"name": "Honda", "code": "2012", "address": "Yellow"},
            {"name": "Jaguar", "code": "2013", "address": "Orange"},
            {"name": "Ford", "code": "2000", "address": "Black"},
            {"name": "Fiat", "code": "2013", "address": "Red"},
            {"name": "VW", "code": "2012", "address": "Orange"},
            {"name": "Audi", "code": "2011", "address": "Black"},
            {"name": "Renault", "code": "2005", "address": "Gray"},
            {"name": "BMW", "code": "2003", "address": "Blue"},
            {"name": "Mercedes", "code": "1995", "address": "Orange"},
            {"name": "Volvo", "code": "2005", "address": "Black"},
            {"name": "Honda", "code": "2012", "address": "Yellow"},
            {"name": "Jaguar", "code": "2013", "address": "Orange"},
            {"name": "Ford", "code": "2000", "address": "Black"},
            {"name": "Fiat", "code": "2013", "address": "Red"},
            {"name": "VW", "code": "2012", "address": "Orange"},
            {"name": "Audi", "code": "2011", "address": "Black"},
            {"name": "Renault", "code": "2005", "address": "Gray"},
            {"name": "BMW", "code": "2003", "address": "Blue"},
            {"name": "Mercedes", "code": "1995", "address": "Orange"},
            {"name": "Volvo", "code": "2005", "address": "Black"},
            {"name": "Honda", "code": "2012", "address": "Yellow"},
            {"name": "Jaguar", "code": "2013", "address": "Orange"},
            {"name": "Ford", "code": "2000", "address": "Black"},
            {"name": "Fiat", "code": "2013", "address": "Red"},
            {"name": "VW", "code": "2012", "address": "Orange"},
            {"name": "Audi", "code": "2011", "address": "Black"},
            {"name": "Renault", "code": "2005", "address": "Gray"},
            {"name": "BMW", "code": "2003", "address": "Blue"},
            {"name": "Mercedes", "code": "1995", "address": "Orange"},
            {"name": "Volvo", "code": "2005", "address": "Black"},
            {"name": "Honda", "code": "2012", "address": "Yellow"},
            {"name": "Jaguar", "code": "2013", "address": "Orange"},
            {"name": "Ford", "code": "2000", "address": "Black"},
            {"name": "Fiat", "code": "2013", "address": "Red"},
            {"name": "Volvo", "code": "2005", "address": "Black"},
            {"name": "Honda", "code": "2012", "address": "Yellow"},
            {"name": "Jaguar", "code": "2013", "address": "Orange"},
            {"name": "Ford", "code": "2000", "address": "Black"},
            {"name": "Fiat", "code": "2013", "address": "Red"}
        ];
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

    loadChunk(index, length): LocationModel[] {
        let chunk: LocationModel[] = [];
        for (let i = 0; i < length; i++) {
            chunk[i] = {...this.inmemoryData[i], ...{vin: (index + i)}};
        } 

        return chunk;
    }
}