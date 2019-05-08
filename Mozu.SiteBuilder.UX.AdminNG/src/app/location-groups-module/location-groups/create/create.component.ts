import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoggerService } from '@core'

@Component({
    selector: 'location-group-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.css'],
    providers: []
})
export class LocationGroupCreateComponent implements OnInit {
    constructor(
        private _loggerService: LoggerService,
        private router: Router) { }

    ngOnInit() {
        this._loggerService.info("LocationGroupCreateComponent : ngOnInit");
    }
}