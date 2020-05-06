import { Component, OnInit } from '@angular/core';
import { LoggerService } from '@core';
import { Constants } from '@shared/infrastructure/constants';

@Component({
  selector: 'header-oms-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class HeaderOmsNavigationComponent implements OnInit {

  public OMSOnlycustomerCareUrl = Constants.headerOMSOnlyURL.customerCareUrl;
  public OMSOnlyFulfillerUrl = Constants.headerOMSOnlyURL.fulfillerUrl;

  constructor( 
    private _loggerService: LoggerService,
    ) { }
  
  ngOnInit() {
    this._loggerService.info('HeaderOmsNavigationComponent : ngOnInit');
  }

}
