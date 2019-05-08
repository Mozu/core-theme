import { Injectable } from '@angular/core';
import { Constants } from '../infrastructure/constants';
import { Observable } from 'rxjs';
import { LoggerService } from '@core'
import { HttpClientService } from '@core/extensions/http-client.service';

@Injectable()
export class LocationsListService {
  constructor(private _http: HttpClientService,   
  private _loggerService: LoggerService) {}

  getLocations(){
    return this._http.get(Constants.JsonResources.dasbhoardTiles);
  }
}