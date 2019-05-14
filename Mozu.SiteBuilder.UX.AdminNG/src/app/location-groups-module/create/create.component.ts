import { Component, OnInit, HostListener, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoggerService } from '@core'
import {TreeNode, SelectItem} from 'primeng/components/common/api';
import { trigger, state, transition, style, animate } from '@angular/animations';  
import { DOCUMENT } from '@angular/common';
import { LocationsListModel } from '@shared';
import * as _ from 'lodash';

@Component({
    selector: 'location-group-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.css'],
    providers: []
})
export class LocationGroupCreateComponent implements OnInit {
    physicalLocation : TreeNode;
    selectedLocations: LocationsListModel[];
    cities1: SelectItem[];
    selectedCities1: LocationsListModel[];
    constructor(
        private _loggerService: LoggerService,
        private router: Router) { }

    ngOnInit() {
        this._loggerService.info("LocationGroupCreateComponent : ngOnInit");
        this.selectedLocations = [];

        this.cities1 = [
            {label:'New York', value:{id:1, name: 'New York', code: 'NY'}},
            {label:'Rome', value:{id:2, name: 'Rome', code: 'RM'}},
            {label:'London', value:{id:3, name: 'London', code: 'LDN'}},
            {label:'Istanbul', value:{id:4, name: 'Istanbul', code: 'IST'}},
            {label:'Paris', value:{id:5, name: 'Paris', code: 'PRS'}}
        ];
    }
    
    onPhysicalLocationSelect(physicalLocation:TreeNode){
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