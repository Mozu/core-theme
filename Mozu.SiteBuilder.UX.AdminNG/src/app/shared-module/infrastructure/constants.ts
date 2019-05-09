
import { ConfigurationSettings } from './configuration-settings';
import { environment } from '../../../environments/environment';

export class Constants {

    static regExType = {
        numeric: /^\d+$/,
        alphanumeric: /^[a-zA-Z0-9]*$/,
        alphanumericWithSpace: /^[a-zA-Z0-9 ]*$/,
        alphanumWithSpecial1: /^[a-zA-Z0-9!''#$%&( )*+,./:;=?@^_-]*$/,
        decimalPrecisionFour: /^([0-9]*([.]{1}[0-9]{0,4})?)$/,
        decimalPrecisionTwo: /^([0-9]*([.]{1}[0-9]{0,2})?)$/,
        negativedecimalPrecisionFour: /^(-?[0-9]*([.]{1}[0-9]{0,4})?)$/,

        alph1anum1: '^.*(?=.{7,})(?=.*[0-9])(?=.*[a-zA-Z]).*$',
        phoneKey: /^[a-zA-Z0-9( )-]*$/,
        email: /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/
    };

    static cookies =
    {
        sessionId: 'SessionId'
    };

    static requestHeader =
    {
        authorization: 'Authorization',
        sessionId: 'SessionId',
        bearer: 'Bearer',
        accept: 'Accept',
        contentType: 'Content-Type'
    };

    static apiToken = {
        refreshToken: 'grant_type=refresh_token&client_id=web&refresh_token='
    };

    static contentType =
    {
        json: 'application/json; charset=utf-8',
        formUrlEncoded: 'application/x-www-form-urlencoded',
        multiPart: 'multipart/form-data'
    };

    static uiRoutes = {
        empty: '',
        default: ConfigurationSettings.defaultRoutePrefix,
        quotes : 'quotes',
        quotesEdit : 'quotesEdit',
        locationGroups : 'locationGroups',
        locationGroupCreate : 'locationGroupCreate'
    };
    
    static webApis = {
        login: environment.apiUrl + 'account/login',
        logout: environment.apiUrl + 'account/logout',
    };

    static webUrls = {
        getSharedData: environment.apiUrl + 'account/getUserData',
        secureFormLink : environment.apiUrl + '/capabilities/createSecureForm?appId='
    };

    static businessExceptions = {
        SessionExpired: 'SessionExpired',
        SessionKilled: 'SessionKilled',
        ErrorCode: 'ErrorCode',
        MessageCode: 'MessageCode'
    };

    static queryString = {
        SessionExpired: 'SessionExpired=true',
        SessionKilled: 'SessionKilled=true'
    };

    static localStorageKeys = {
        userName : 'userName',
        apiToken : 'apiToken',
        isLoggedIn : 'isLoggedIn',
        sessionId : 'sessionId'
    };

    static imageExtension =
    {
        jpeg: '.jpeg',
        jpg: '.jpg'
    };

    static headerConstant =
    {
        xpLogo: 'xpTopRightLogo.png',
    };

    static splitChars = {
        comma: ','
    };

    static mainTileJsonNavParentPrefix : string = "main";
    static systemTileJsonNavParentPrefix : string = "sys";
    static systemTabDisplayText : string = "System"; // TODO : Use Enum here.
    static LefMenuMainTabJsonNavParentPrefix : string = "main";
    static LefMenuSystemTabJsonNavParentPrefix : string = "sys";
    static voidNavigationLink : string = "javascript:void(0)";

    static leftNavigationSource: string = environment.appUrl + "/assets/json/leftNavigation-items.json";

    static localizationMenu : string = 'localization';

    static JsonResources = {
        leftNavigationItems :  "./assets/json/leftNavigation-items.json",
        tabsNames : "./assets/json/dashboard-menu.json",
        dasbhoardTiles : "./assets/json/dashboard-categories.json",
        quoteList : "./assets/json/quote-list.json",
        redirectionLink : "./assets/json/user-redirection.json",
        locations : "./assets/json/locations.json",
        physicalLocations : './assets/json/physical-locations.json' 
    }

    static lables = {
        closeLabel :  'close'
    }

    static numberOfRows: number = 15;

    static integrationsModalClass = 'integrationsModal';
    static integrationsBackdropModalClass = 'integrationsBackdropModal';
    static messageHash = '&messageHash=';
    static dateStamp = '?dt=';
    static urlParameter ={
        site: '/s-',
        b2bAccount: '/b2baccounts',
        edit: '/edit/'
    }
}
