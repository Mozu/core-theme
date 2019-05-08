import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { LoggerService } from '@core'

import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'location-group-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
    providers: []
})
export class LocationGroupsListComponent implements OnInit {
    constructor(
        private _loggerService: LoggerService,
        private _translate: TranslateService,
        private router: Router) { }

    ngOnInit() {
        this._loggerService.info("LocationGroupsListComponent : ngOnInit");
    }
}