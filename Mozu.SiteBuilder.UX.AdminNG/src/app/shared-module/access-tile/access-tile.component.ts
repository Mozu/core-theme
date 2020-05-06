import { Component,
  Input
} from '@angular/core';

import {  LoggerService } from '@core';

import { Constants } from '@shared/infrastructure/constants';

import { AccessTileModel } from './access-tile.model';

@Component({
  selector: 'access-tile',
  templateUrl: './access-tile.component.html',
  styleUrls: ['./access-tile.component.css']
})
export class AccessTileComponent {

  @Input('Tiles') tileModel: AccessTileModel;
  quotesRoute = Constants.uiRoutes.quotes;
  locationGroupRoute =  Constants.uiRoutes.locationGroups;
  inventoryTitle = Constants.titles.inventory;
  locationGroupsTitle = Constants.titles.locationGroups;

  constructor(private _loggerService: LoggerService) {
  }
}
