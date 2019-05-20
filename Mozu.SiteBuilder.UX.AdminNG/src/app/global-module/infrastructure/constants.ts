import { environment } from '../../../environments/environment';


export class Constants {

    static uiRoutes = {
        login: 'login',
        shop: 'shop',
        cart: 'cart',
        quotes: 'quotes',
        locationGroups: 'locationGroups'
    };

    static businessExceptions = {
        SessionExpired: 'SessionExpired',
        SessionKilled: 'SessionKilled',
        ErrorCode: 'ErrorCode',
        MessageCode: 'MessageCode'
    };

    static webApis = {
        getSharedData: environment.apiUrl + '/user/identity',
        getPhysicalLocations : environment.apiUrl + '/location/physical'
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

}
