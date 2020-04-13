import { environment } from '../../../environments/environment';


export class Constants {

    static uiRoutes = {
        login: 'login',
        shop: 'shop',
        cart: 'cart',
        quotes: 'quotes',
        locationGroups: 'locationGroups',
        admin : 'admin'
    };

    static businessExceptions = {
        SessionExpired: 'SessionExpired',
        SessionKilled: 'SessionKilled',
        ErrorCode: 'ErrorCode',
        MessageCode: 'MessageCode'
    };

    static webApis = {
        getSharedData: environment.apiUrl + '/user/identity',
        getPhysicalLocations : environment.apiUrl + '/location/physical',
        addLocationGroup : environment.apiUrl + '/location/groups/create',
        editLocationGroup : environment.apiUrl + '/location/groups/edit',
        getLocationGroups : environment.apiUrl + '/location/groups/list',
        getLocationGroup : environment.apiUrl + '/location/groups/get',
        getLocationGroupConfig : environment.apiUrl + '/location/group/configuration',
        deleteLocationGroup : environment.apiUrl + '/location/groups/delete',
        getQuoteList : environment.apiUrl + '/quote/list',
        getB2BUserAccount: environment.apiUrl + '/b2baccount',
        getCarrierSettings: environment.apiUrl + '/shipping/carrierSettings/read',
        getAllCarrierRatesWithConfiguredInfo: environment.apiUrl + '/shipping/carrierRatesWithConfigured',
        getAllB2BAccounts: environment.apiUrl + '/b2baccount/list',
        getCarrierAccountsSets: environment.apiUrl + '/carriers/credentialsset/list',
        getCarrierAccounts: environment.apiUrl + '/carriers/credentials/read',
        saveCarrierAccount: environment.apiUrl + '/carriers/credentials/save'
    };

    static JsonResources = {
        userIdentity: '/assets/json/user-data.json'
    };
    static queryString = {
        SessionExpired: 'SessionExpired=true'
    };

    // static localStorageKeys = {
    //     sessionId: 'sessionId'
    // };

    static cookies =
    {
        sessionId: 'SessionId',
        apiContext: 'apiContext'
    };

    static HttpHeadersParams = {
        xVolTenant: 'x-vol-tenant',
        xVolMasterCatlog: 'x-vol-master-catalog',
        xVolCatalog: 'x-vol-catalog',
        xVolSite: 'x-vol-site',
        xVolLocale: 'x-vol-locale',
        xVolCurrency: 'x-vol-currency'
    };
}
