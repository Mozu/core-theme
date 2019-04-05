import { Component, OnInit } from '@angular/core';
import {  LoggerService } from '@core'

import {
  TopNavigationFlag
} from '@shared/index';

@Component({
  selector: 'admin-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class AdminHomeComponent implements OnInit {
  dashboardNavigation = TopNavigationFlag.dashboard;

  constructor(private _loggerService : LoggerService) {
    this._loggerService.info("AdminHomeComponent : constructor");
   }

  ngOnInit() {
    this._loggerService.info("AdminHomeComponent : ngOnInit");
  }

}
