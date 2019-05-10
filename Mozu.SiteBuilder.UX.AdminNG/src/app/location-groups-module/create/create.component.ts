import { Component, OnInit, HostListener, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoggerService } from '@core'
import {TreeNode} from 'primeng/components/common/api';
import { trigger, state, transition, style, animate } from '@angular/animations';  
import { DOCUMENT } from '@angular/common';

@Component({
    selector: 'location-group-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.css'],
    providers: []
})
export class LocationGroupCreateComponent implements OnInit {
    physicalLocation : TreeNode;
    constructor(
        private _loggerService: LoggerService,
        private router: Router) { }

    ngOnInit() {
        this._loggerService.info("LocationGroupCreateComponent : ngOnInit");
    }
    
    onPhysicalLocationSelect(physicalLocation:TreeNode){
        this._loggerService.info("LocationGroupCreateComponent : onPhysicalLocationSelect"+ JSON.stringify(physicalLocation));
        this.physicalLocation = physicalLocation;
    }
    @HostListener('window:scroll', ['$event'])
    onWindowScroll(e) {
       if (window.pageYOffset > 20) {
         let element = document.getElementById('stickynav');
         element.classList.add('sticky');
         let element2 = document.getElementById('main-container');
         element2.classList.add('forextratoppadding');
         //
       } else {
        let element = document.getElementById('stickynav');
          element.classList.remove('sticky'); 
            let element2 = document.getElementById('main-container');
              element2.classList.remove('forextratoppadding');
       }
    }
    scroll(el: HTMLElement) {
        el.scrollIntoView({behavior: 'smooth'});
      }
}