import { Injectable} from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
LoggerService,
HttpClientService,
IRequestOptions
} from '@core';
import { Constants as GlobalConstant } from '@global/infrastructure/constants';
import { Constants } from '@shared';
import { environment } from '@env';
import { LocationGroupConfigurationModel, CarrierAccountModel, PagniatedNgSelectPageConfiguration } from './config.model';

@Injectable()
export class LocationGroupConfigService {
    constructor(private _http: HttpClientService,
        private _loggerService: LoggerService) { }

    public getLocationGroupConfig(locationGroupCode: string, siteId : string): Observable<any> {
        this._loggerService.info('LocationGroupConfigService: getLocationGroupConfig');
        if (environment.isUseMocks) {
            return this._http.get(Constants.JsonResources.getLocationGroupConfig);
        } else {
            return this._http.get(GlobalConstant.webApis.getLocationGroupConfig + '/' + locationGroupCode + '/' + siteId );
        }
    }

    public updateLocationGroupConfig(lgcModel: LocationGroupConfigurationModel): Observable<any> {
        this._loggerService.info('LocationGroupConfigService: updateLocationGroupConfig' + JSON.stringify(lgcModel));
        if (environment.isUseMocks) {
            return of(new HttpResponse({ status: 200 }));
         } else {
            return this._http.Put(GlobalConstant.webApis.getLocationGroupConfig + '/' + lgcModel.locationGroupCode + '/' + lgcModel.siteId, lgcModel);
         }
    }

    public getCarrierSettings(opts: IRequestOptions): Observable<any> {
        this._loggerService.info('LocationGroupConfigService: getCarrierSettings');
        if (environment.isUseMocks) {
            return this._http.get(Constants.JsonResources.getCarrierSettings, opts);
        } else {
            return this._http.get(GlobalConstant.webApis.getCarrierSettings, opts);
        }
    }

    public getAllCarrierRatesWithConfiguredInfo(opts: IRequestOptions): Observable<any> {
        this._loggerService.info('LocationGroupConfigService: getAllCarrierRatesWithConfiguredInfo');
        if (environment.isUseMocks) {
            return this._http.get(Constants.JsonResources.getAllCarrierRatesWithConfiguredInfo, opts);
        } else {
            return this._http.get(GlobalConstant.webApis.getAllCarrierRatesWithConfiguredInfo, opts);
        }
    }
    public getCarrierAccountSets(pageInfo: PagniatedNgSelectPageConfiguration,carrierId:string): Observable<any> {
        this._loggerService.info('LocationGroupConfigService: getCarrierAccountSets');
        const params = `?start=${pageInfo.startIndex}&limit=${pageInfo.pageSize}&query=${pageInfo.query}&carrierId=${carrierId}`;
        if (environment.isUseMocks) {
            return this._http.get(Constants.JsonResources.carrierAccountSets);
        } else {
            return this._http.get(GlobalConstant.webApis.getCarrierAccountsSets + params)
        }
    }

    public getCarrierAccount(locationGroupCode: string, siteId: string): Observable<any> {
        this._loggerService.info('LocationGroupConfigService: getcarrierAccount');
        if (environment.isUseMocks) {
            return this._http.get(Constants.JsonResources.carrierAccount);
        } else {
            return this._http.get(GlobalConstant.webApis.getCarrierAccounts + '?locationGroupCode=' + locationGroupCode + '&siteId=' + siteId);
        }
    }

    public SaveCarrierAccount(carrierAccount: CarrierAccountModel[]): Observable<any> {
        this._loggerService.info('LocationGroupConfigService: SaveCarrierAccount' + JSON.stringify(carrierAccount));
        if (environment.isUseMocks) {
            return of(new HttpResponse({ status: 200 }));
        }
        else {
            return this._http.post(GlobalConstant.webApis.saveCarrierAccount, carrierAccount);
        }
    }

}
