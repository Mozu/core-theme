import { Component, 
  OnInit ,
  Input
} from '@angular/core';

import {  LoggerService } from '@core'

import { Constants } from '@shared/infrastructure/constants';

import { AccessTileModel } from './access-tile.model'

@Component({
  selector: 'access-tile',
  templateUrl: './access-tile.component.html',
  styleUrls: ['./access-tile.component.css']
})
export class AccessTileComponent implements OnInit {

  @Input('Tiles') tileModel : AccessTileModel;
  uiRoutes = Constants.uiRoutes.quotes;
  
  constructor(private _loggerService : LoggerService) { 
    this._loggerService.info("AccessTileComponent : constructor");
  }

  ngOnInit() {
    this._loggerService.info("AccessTileComponent : ngOnInit");
  }

}
