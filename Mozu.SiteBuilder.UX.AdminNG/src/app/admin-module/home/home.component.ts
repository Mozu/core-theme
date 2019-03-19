import { Component, OnInit } from '@angular/core';
import {  LoggerService } from '@core'

@Component({
  selector: 'admin-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class AdminHomeComponent implements OnInit {

  constructor(private _loggerService : LoggerService) {
    this._loggerService.info("AdminHomeComponent : constructor");
   }

  ngOnInit() {
    this._loggerService.info("AdminHomeComponent : ngOnInit");
  }

}
