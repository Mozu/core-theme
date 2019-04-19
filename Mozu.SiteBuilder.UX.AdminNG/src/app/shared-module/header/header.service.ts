import { Injectable } from '@angular/core';
import { Constants } from '../infrastructure/constants';
import { HttpClientService } from '@core/extensions/http-client.service'
import { LoggerService } from '@core'



@Injectable()
export class HeaderService {

  constructor( private _http: HttpClientService, private _loggerService: LoggerService ) { }
 
  public fetchRedirectionLinks = () => {
    this._loggerService.info("HeaderService : fetchRedirectionLink");
    return this._http.get(Constants.JsonResources.redirectionLink);
  }
}

