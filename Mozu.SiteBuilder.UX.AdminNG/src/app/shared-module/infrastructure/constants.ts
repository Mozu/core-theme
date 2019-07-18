
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
        getLocationGroupConfig : environment.appUrl + '/assets/json/location-group-configuration.json',
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


    static LCCustomerPickupActions = [ {data : 'CustomerCare', label: 'Customer Care'}, {data: 'Cancel', label: 'Cancel'}];
    static LCCustomerPickupReminders = [ {data : 1, label: '1 days'}, {data: 2, label: '2 days'}, {data: 3, label: '3 days'},
                                        {data: 4, label: '4 days'}, {data: 5, label: '5 days'}];
    static LCCarriers = [{ CarrierType: 'FedEx', CarrierTypeLabel: 'FedEx', IsEnabled: false},
                         { CarrierType: 'UPS', CarrierTypeLabel: 'Ups', IsEnabled: false},
                         { CarrierType: 'USPS', CarrierTypeLabel: 'USPS (Endicia)', IsEnabled: false},
                         { CarrierType: 'Canada Post', CarrierTypeLabel: 'Canada Post', IsEnabled: false}];
    static LCDefaultCarrier = [{data: 'None', label: 'None'},
                               {data: 'FedEx', label: 'Fedex'},
                               {data: 'Ups', label: 'Ups'},
                               {data: 'USPS', label: 'USPS (Endicia)'},
                               {data: 'Canada Post', label: 'Canada Post'}];
    static LCPrintReturnLabel = [{data: true, label: 'Yes'}, {data: false, label: 'No'}];
    static LCDefaultPrinterType = [{data: 'Laser', label: 'Laser'}, {data: 'Thermal', label: 'Thermal'}];
    static LCUPSUSShippingTypes = [{data: 'UPS_NEXT_DAY_AIR_EARLY_AM', label: 'UPS_NEXT_DAY_AIR_EARLY_AM'},
                                   {data: 'UPS_NEXT_DAY_AIR_SAVER', label: 'UPS_NEXT_DAY_AIR_SAVER'},
                                   {data: 'UPS_NEXT_DAY_AIR', label: 'UPS_NEXT_DAY_AIR'},
                                   {data: 'UPS_2ND_DAY_AIR_AM', label: 'UPS_2ND_DAY_AIR_AM'},
                                   {data: 'UPS_2ND_DAY_AIR', label: 'UPS_2ND_DAY_AIR'},
                                   {data: 'UPS_3_DAY_SELECT', label: 'UPS_3_DAY_SELECT'},
                                   {data: 'UPS_GROUND', label: 'UPS_GROUND'},
                                   {data: 'UPS_SURE_POST_LESS_THAN_1_POUND', label: 'UPS_SURE_POST_LESS_THAN_1_POUND'},
                                   {data: 'UPS_SURE_POST_1_POUND_OR_GREATER', label: 'UPS_SURE_POST_1_POUND_OR_GREATER'}];

    static LCUPSInternationalShippingTypes = [{data: 'UPS_STANDARD', label: 'UPS_STANDARD'},
                                              {data: 'UPS_EXPRESS', label: 'UPS_EXPRESS'},
                                              {data: 'UPS_EXPRESS_PLUS', label: 'UPS_EXPRESS_PLUS'},
                                              {data: 'UPS_EXPEDITED', label: 'UPS_EXPEDITED'},
                                              {data: 'UPS_SAVER', label: 'UPS_SAVER'},
                                              {data: 'UPS_ACCESS_POINT_ECONOMY', label: 'UPS_ACCESS_POINT_ECONOMY'}];

    static LCUPSCanadaShippingTypes = [{data: 'UPS_NEXT_DAY_AIR_SAVER', label: 'UPS_NEXT_DAY_AIR_SAVER'},
                                              {data: 'UPS_2ND_DAY_AIR', label: 'UPS_2ND_DAY_AIR'},
                                              {data: 'UPS_3_DAY_SELECT', label: 'UPS_3_DAY_SELECT'},
                                              {data: 'UPS_STANDARD', label: 'UPS_STANDARD'}];

    static LCUSPSShippingTypes = [{data: 'PRIORITYEXPRESS', label: 'PRIORITYEXPRESS'},
                                   {data: 'FIRST', label: 'FIRST'},
                                   {data: 'LIBRARYMAIL', label: 'LIBRARYMAIL'},
                                   {data: 'MEDIAMAIL', label: 'MEDIAMAIL'},
                                   {data: 'STANDARDPOST', label: 'STANDARDPOST'},
                                   {data: 'PRIORITY', label: 'PRIORITY'},
                                  ];

    static LCFedExShippingType = [{data: 'FIRST_OVERNIGHT', label: 'FIRST_OVERNIGHT'},
                                  {data: 'FIRST_OVERNIGHT_SATURDAY_DELIVERY', label: 'FIRST_OVERNIGHT_SATURDAY_DELIVERY'},
                                  {data: 'PRIORITY_OVERNIGHT', label: 'PRIORITY_OVERNIGHT'},
                                  {data: 'PRIORITY_OVERNIGHT_SATURDAY_DELIVERY', label: 'PRIORITY_OVERNIGHT_SATURDAY_DELIVERY'},
                                  {data: 'STANDARD_OVERNIGHT', label: 'STANDARD_OVERNIGHT'},
                                  {data: 'FEDEX_2_DAY_AM', label: 'FEDEX_2_DAY_AM'},
                                  {data: 'FEDEX_2_DAY', label: 'FEDEX_2_DAY'},
                                  {data: 'FEDEX_2_DAY_SATURDAY_DELIVERY', label: 'FEDEX_2_DAY_SATURDAY_DELIVERY'},
                                  {data: 'FEDEX_EXPRESS_SAVER', label: 'FEDEX_EXPRESS_SAVER'},
                                  {data: 'FEDEX_GROUND', label: 'FEDEX_GROUND'},
                                  {data: 'GROUND_HOME_DELIVERY', label: 'GROUND_HOME_DELIVERY'},
                                  {data: 'SMART_POST', label: 'SMART_POST'}];
}
