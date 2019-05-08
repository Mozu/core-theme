import { Injectable } from '@angular/core';
import { Constants } from '@shared';
import { Observable } from 'rxjs';
import { HttpClientService, LoggerService } from '@core';

@Injectable()
export class LocationService {
  constructor(private _http: HttpClientService,   
  private _loggerService: LoggerService) {}

  getLocations(){
    return this._http.get(Constants.JsonResources.dasbhoardTiles);
  }
}