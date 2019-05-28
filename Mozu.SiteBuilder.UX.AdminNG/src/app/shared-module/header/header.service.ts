import { Injectable } from '@angular/core';
import { LoggerService } from '@core'
import { HttpClientService } from '@core/extensions/http-client.service'
import { Constants } from '../infrastructure/constants';




@Injectable()
export class HeaderService {

  constructor( 
    private _httpClientService : HttpClientService,
    private _loggerService: LoggerService ) { }
 
  public fetchRedirectionLinks = () => {
    this._loggerService.info("HeaderService : fetchRedirectionLink");
    return this._httpClientService.get(Constants.JsonResources.redirectionLink);
  }
}

