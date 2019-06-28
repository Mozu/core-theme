import { Injectable } from '@angular/core';
import { Constants } from '../infrastructure/constants';
import { LoggerService } from '@core';
import { HttpClientService } from '@core/extensions/http-client.service';

@Injectable()
export class LocationsListService {
  constructor(private _http: HttpClientService,
  private _loggerService: LoggerService) {}

  getLocations(physicalLocationName) {
    return this._http.get(Constants.JsonResources.locations);
  }
}
