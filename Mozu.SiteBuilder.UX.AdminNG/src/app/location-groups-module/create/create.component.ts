import { Component, OnInit, HostListener, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoggerService } from '@core'
import {TreeNode, SelectItem} from 'primeng/components/common/api';
import { LocationsListModel } from '@shared';
import * as _ from 'lodash';
import { SharedDataService } from '@global';

@Component({
    selector: 'location-group-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.css'],
    providers: []
})
export class LocationGroupCreateComponent implements OnInit {
    physicalLocation : TreeNode;
    selectedLocations: LocationsListModel[];
    selectedCities1: LocationsListModel[];
    sitesLst : any[];
    sitesRows : any[];    
    constructor(
        private _loggerService: LoggerService,
        private _sharedData : SharedDataService,
        private router: Router) { 

    }

    ngOnInit() {
        this._loggerService.info("LocationGroupCreateComponent : ngOnInit");
        this.selectedLocations = [];
        this.fetchSitesData();        
    }
    
    public fetchSitesData = () => {
        this._loggerService.info("LocationGroupCreateComponent : fetchSitesData");
        this.sitesRows = [];
        if(this._sharedData._sharedData.items.ctTenant.sites){
            this.sitesLst = this._sharedData._sharedData.items.ctTenant.sites;
            if(this.sitesLst){
                for(var cnt = 0; cnt<this.sitesLst.length; cnt+=3){
                    this.sitesRows.push(this.sitesLst.slice(cnt, cnt+3))
                }
            }
        }
    }

    physicalLocationSelected(physicalLocation:TreeNode){
        this._loggerService.info("LocationGroupCreateComponent : onPhysicalLocationSelect"+ JSON.stringify(physicalLocation));
        this.physicalLocation = physicalLocation;
    }

    onLocationSelect(location:LocationsListModel){
        this._loggerService.info("LocationGroupCreateComponent : onLocationSelect"+ JSON.stringify(location));
        let arr = this.selectedLocations.slice();
        arr.push(location);
        this.selectedLocations = arr;
    }

    onLocationUnselect(location:LocationsListModel){
        this._loggerService.info("LocationGroupCreateComponent : onLocationUnselect"+ JSON.stringify(location));
        this.selectedLocations = _.remove(this.selectedLocations, ["code",_.toString(location.code)]);
    }

    @HostListener('window:scroll', ['$event'])
    onWindowScroll(e) {
       if (window.pageYOffset > 60) {
         let element = document.getElementById('stickynav');
         element.classList.add('sticky');
         //let element2 = document.getElementById('main-container');
         //element2.classList.add('forextratoppadding');
         //
       } else {
        let element = document.getElementById('stickynav');
          element.classList.remove('sticky'); 
            //let element2 = document.getElementById('main-container');
            //element2.classList.remove('forextratoppadding');
       }
    }
    scroll(el: HTMLElement) {
        el.scrollIntoView({behavior: 'smooth'});
      }
}