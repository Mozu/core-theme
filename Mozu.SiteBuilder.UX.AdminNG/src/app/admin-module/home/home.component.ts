import { Component, OnInit } from '@angular/core';
import {  LoggerService } from '@core'

import {
  NavigationContainerType
} from '@shared/index';

@Component({
  selector: 'admin-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class AdminHomeComponent implements OnInit {
  navigationContainerType = NavigationContainerType;

  constructor(private _loggerService : LoggerService) { }

  ngOnInit() { }

}
