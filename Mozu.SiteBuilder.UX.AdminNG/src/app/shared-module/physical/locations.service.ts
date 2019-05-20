import { Injectable } from '@angular/core';
import { Constants } from '../infrastructure/constants';
import { Constants as GlobalConstant } from '@global/infrastructure/constants';
import { Observable } from 'rxjs';
import { LoggerService } from '@core'
import { HttpClientService } from '@core/extensions/http-client.service';

@Injectable()
export class PhysicalLocationsService {
  constructor(private _http: HttpClientService,   
  private _loggerService: LoggerService) {}

  getPhysicalLocations(){
    return this._http.get(Constants.JsonResources.physicalLocations);//NOTE - use it while running angular on localhost
    //return this._http.get(GlobalConstant.webApis.getPhysicalLocations);
  }
}