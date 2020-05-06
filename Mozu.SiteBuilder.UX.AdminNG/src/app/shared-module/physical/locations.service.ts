import { Injectable } from '@angular/core';
import { LoggerService } from '@core';
import { HttpClientService } from '@core/extensions/http-client.service';
import { Constants as GlobalConstant } from '@global/infrastructure/constants';
import { environment } from '@env';
import { Constants } from '../infrastructure/constants';

@Injectable()
export class PhysicalLocationsService {
  constructor(private _http: HttpClientService,
    private _loggerService: LoggerService) { }

  getPhysicalLocations() {
    if (environment.isUseMocks) {
      return this._http.get(Constants.JsonResources.physicalLocations);
    } else {
      return this._http.get(GlobalConstant.webApis.getPhysicalLocations);
    }
  }
}
