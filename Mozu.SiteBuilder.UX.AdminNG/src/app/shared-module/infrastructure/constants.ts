
import { ConfigurationSettings } from './configuration-settings';
import { environment } from '../../../environments/environment';
import { SubtotalOptions } from './enums';

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

    static orderRoutingNavigationId = 'orderRouting';
    
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
        quotes: 'quotes',
        quotesEdit: 'quotes/edit',
        locationGroups: 'locationGroups',
        locationGroupCreate: 'locationGroupCreate',
        locationGroupEdit: 'locationGroupEdit',
        locationGroupConfig: 'locationGroupConfig',
    };

    static webApis = {
        login: environment.apiUrl + 'account/login',
        logout: environment.apiUrl + 'account/logout',
        getSharedData: environment.apiUrl + 'account/getUserData',
        secureFormLink: environment.apiUrl + '/capabilities/createSecureForm?appId=',
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
        userName: 'userName',
        apiToken: 'apiToken',
        isLoggedIn: 'isLoggedIn',
        sessionId: 'sessionId',
        quoteGridData: 'QuoteGridData',
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
    static systemTabDisplayText = 'SYSTEM'; // TODO : Use Enum here.
    static LefMenuMainTabJsonNavParentPrefix = 'main';
    static LefMenuSystemTabJsonNavParentPrefix = 'sys';
    static voidNavigationLink = 'javascript:void(0)';

    static leftNavigationSource: string = environment.appUrl + '/assets/json/leftNavigation-items.json';

    static localizationMenu = 'localization';

    static JsonResources = {
        leftNavigationItems: environment.appUrl + '/assets/json/leftNavigation-items.json',
        tabsNames: environment.appUrl + '/assets/json/dashboard-menu.json',
        dasbhoardTiles: environment.appUrl + '/assets/json/dashboard-categories.json',
        quoteList: environment.appUrl + '/assets/json/quote-list.json',
        accountInformation: environment.appUrl + '/assets/json/account-information.json',
        b2bAccounts: environment.appUrl + '/assets/json/b2b-accounts.json',
        redirectionLink: environment.appUrl + '/assets/json/user-redirection.json',
        locations: environment.appUrl + '/assets/json/locations.json',
        physicalLocations: environment.appUrl + '/assets/json/physical-locations.json',
        locationGroupList: environment.appUrl + '/assets/json/location-group-list.json',
        getLocationGroup: environment.appUrl + '/assets/json/location-group-edit.json',
        getLocationGroupConfig: environment.appUrl + '/assets/json/location-group-configuration.json',
        getCarrierSettings: environment.appUrl + '/assets/json/location-config-carrier-settings-read.json',
        getAllCarrierRatesWithConfiguredInfo: environment.appUrl + '/assets/json/location-config-carrier-rates-with-configured.json',
        shippingMethods: '/assets/json/shipping-methods.json',
        auditLog: '/assets/json/audit-log.json',
        orderSearchResults: environment.appUrl + '/assets/json/orders-searchresult.json',
        customerSearchResults: environment.appUrl + '/assets/json/customers-searchresult.json',
        productsSearchResults: environment.appUrl + '/assets/json/products-searchresult.json',
        carrierAccountSets: environment.appUrl + '/assets/json/CarrierAccountSet.json',
        carrierAccount: environment.appUrl + '/assets/json/CarrierAccount.json'
    };

    static numberOfRows = 15;
    static locationGroupDefaultCountry = 'US';
    static gridActionItem = {
        Edit: 'Edit',
        New: 'New',
        Delete: 'Delete'
    };

    static titles = {
        inventory: 'Inventory',
        locationGroups: 'Location Groups'
    };

    static lables = {
        closeLabel: 'close'
    };

    static integrationsModalClass = 'integrationsModal';
    static integrationsBackdropModalClass = 'integrationsBackdropModal';
    static messageHash = '&messageHash=';
    static dateStamp = '?dt=';
    static editNavigationDeepLink = '/edit/';
    static userAPIDeepLink = '/users';

    static dateFormat = 'MMM dd yyyy h:mm aaaaa\'m\'';
    static searchFilterParameter = {
        filterParam1: 'filter=%5B%7B%22property%22%3A%22all%22%2C%22value%22%3A%22',
        filterParam2: '%22%7D%5D',
        masterCatalogHeaderKey: 'masterCatalog',
        tenantHeaderKey: 'tenant'
    };

    static LCCustomerPickupActions = [{ data: 'CustomerCare', label: 'Customer Care' }, { data: 'Canceled', label: 'Cancel' }];

    static PackageSettingUnitTypes = [{ data: 'Imperial', label: 'Imperial' }, { data: 'Metric', label: 'Metric' }];

    static UspsCarrierAccountPageConfig = {
        startIndex: 0,
        pageSize: 15,
        query: "",
        isMultiSelect: false,
        placeholder: 'Search',
        totalRecordCount: 0,
        id: 'USPSCarrierAccount'
    }

    static DefaultUSPSAccount = {
        data: '0',
        label: 'No Carrier Credentials Selected',
    }

    static LCCustomerPickupReminders = [{ data: 1, label: '1 days' }, { data: 2, label: '2 days' }, { data: 3, label: '3 days' },
    { data: 4, label: '4 days' }, { data: 5, label: '5 days' }];
    static LCDefaultCarrier = [{ data: 'None', label: 'None' }];
    static LCCarriers = {
        custom: 'custom',
        usps: 'usps',
        ups: 'ups',
        fedex: 'fedex'
    };
    static LCPrintReturnLabel = [{ data: true, label: 'Yes' }, { data: false, label: 'No' }];
    static LCDefaultPrinterType = [{ data: 'Laser', label: 'Laser' }, { data: 'Thermal', label: 'Thermal' }];
    static classess = {
        ellipsis: 'pi pi-ellipsis-v'
    };

    static queryParameters = {
        filter: 'filter',
        advancedSearch: 'advancedSearch',
        sort: 'sort',
        sortableOrder: { ASC: 'ASC', DESC: 'DESC' },
        startIndex: 'startIndex',
        pageSize: 'pageSize'
    };

    static advancedFilter = {
        keyValueDelimiter: ':',
        searchFieldSeperator: ' ',
        dateKeyword: 'Date',
        from: 'from',
        to: 'to',
        searchBox: 'searchBox',
        keyword: 'keyword',
        name: 'name',
        quoteId: 'quoteId',
        accountUserLastName: 'accountUserLastName',
        accountId: 'accountId',
        expirationFrom: 'expirationFrom',
        expirationTo: 'expirationTo',
        projectName: 'projectName',
        status: 'status',
        createFrom: 'createFrom',
        createTo: 'createTo',
    };

    static quoteSubtotal = [
        { data: 'select', label: 'Select' },
        { data: SubtotalOptions.subTotalExclTax, label: 'Subtotal (Excl. Tax)' },
        { data: SubtotalOptions.subTotalInclTax, label: 'Subtotal (Incl. Tax)' },
        { data: SubtotalOptions.estimatedTax, label: 'Estimated Tax' }
    ];

    static advSearchDateFormat = 'YYYY-MM-DDTHH:mm:ssZ';

    static headerOMSOnlyURL = {
        customerCareUrl: 'https://customer.shopatron.com/customer',
        fulfillerUrl: 'http://www.shopatron.com/fulfiller'
    }
}
