
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
        locationGroupCreate : 'locationGroupCreate',
        locationGroupEdit : 'locationGroupEdit',
        locationGroupConfig : 'locationGroupConfig',
        fulfiller: 'fulfiller',
        fulfillerHome: 'home'
    };

    static webApis = {
        login: environment.apiUrl + 'account/login',
        logout: environment.apiUrl + 'account/logout',
        getSharedData: environment.apiUrl + 'account/getUserData',
        secureFormLink : environment.apiUrl + '/capabilities/createSecureForm?appId=',
        getOrderData: environment.apiUrl + '/order/list',
        getCustomerData: environment.apiUrl + '/customer/list',
        getProductData: environment.apiUrl + '/Product/list'
    };

    static businessExceptions = {
        SessionExpired: 'SessionExpired',
        SessionKilled: 'SessionKilled',
        ErrorCode: 'ErrorCode',
        MessageCode: 'MessageCode'
    };

    static queryString = {
        SessionExpired: 'SessionExpired=true',
        SessionKilled: 'SessionKilled=true',
        GlobalSearchParams: 'searchType=global&page=1&start=0&limit=5'
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

    static mainTileJsonNavParentPrefix = 'main';
    static systemTileJsonNavParentPrefix = 'sys';
    static systemTabDisplayText = 'System'; // TODO : Use Enum here.
    static LefMenuMainTabJsonNavParentPrefix = 'main';
    static LefMenuSystemTabJsonNavParentPrefix = 'sys';
    static voidNavigationLink = 'javascript:void(0)';

    static leftNavigationSource: string = environment.appUrl + '/assets/json/leftNavigation-items.json';

    static localizationMenu = 'localization';

    static JsonResources = {
        leftNavigationItems : environment.appUrl + '/assets/json/leftNavigation-items.json',
        tabsNames : environment.appUrl + '/assets/json/dashboard-menu.json',
        dasbhoardTiles : environment.appUrl + '/assets/json/dashboard-categories.json',
        quoteList : environment.appUrl + '/assets/json/quote-list.json',
        accountInformation: environment.appUrl + '/assets/json/account-information.json',
        redirectionLink : environment.appUrl + '/assets/json/user-redirection.json',
        locations : environment.appUrl + '/assets/json/locations.json',
        physicalLocations : environment.appUrl + '/assets/json/physical-locations.json',
        locationGroupList : environment.appUrl + '/assets/json/location-group-list.json',
        getLocationGroup : environment.appUrl + '/assets/json/location-group-edit.json',
        shippingMethods: '/assets/json/shipping-methods.json',
        auditLog: '/assets/json/audit-log.json',
        orderSearchResults: environment.appUrl + '/assets/json/orders-searchresult.json',
        customerSearchResults: environment.appUrl + '/assets/json/customers-searchresult.json',
        productsSearchResults: environment.appUrl + '/assets/json/products-searchresult.json'
    };

    static numberOfRows = 15;
    static locationGroupDefaultCountry = 'US';
    static gridActionItem = {
        Edit : 'Edit',
        New : 'New',
        Delete : 'Delete'
    };

    static titles = {
        catalogImportExportTitles :  'Catalog Import/export',
    };

    static lables = {
        closeLabel :  'close'
    };

    static integrationsModalClass = 'integrationsModal';
    static integrationsBackdropModalClass = 'integrationsBackdropModal';
    static messageHash = '&messageHash=';
    static dateStamp = '?dt=';
    static editNavigationDeepLink = '/edit/';
    static filterQueryParameter = 'filter';
    static userAPIDeepLink = '/users';


    static LCCustomerPickupActions = [ {data : 'CUSTOMER_CARE', label: 'Customer Care'}, {data: 'CANCEL', label: 'Cancel'}];
    static LCCustomerPickupReminders = [ {data : '1', label: '1 days'}, {data: '2', label: '2 days'}, {data: '3', label: '3 days'},
                                        {data: '4', label: '4 days'}, {data: '5', label: '5 days'}];

    static LCCarriers = [{ CarrierType:'FedEx', CarrierTypeLabel:'FedEx', IsEnabled: false},
                         { CarrierType:'UPS', CarrierTypeLabel:'Ups', IsEnabled: false},
                         {CarrierType:'USPS (endicia)', CarrierTypeLabel:'USPS (endicia)', IsEnabled: false},
                         {CarrierType:'Canada Post', CarrierTypeLabel:'Canada Post', IsEnabled: false}];
}
