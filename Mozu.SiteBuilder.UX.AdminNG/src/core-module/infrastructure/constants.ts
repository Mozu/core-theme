
export class Constants {
        
    static cookies =
    {
        sessionId: "SessionId"
    }

    static requestHeader =
    {
        authorization: "Authorization",
        sessionId: "SessionId",
        bearer: "Bearer",
        accept: "Accept",
        contentType: "Content-Type"
    }

    static apiToken = {
        refreshToken: "grant_type=refresh_token&client_id=web&refresh_token="
    }

    static contentType =
    {
        json: "application/json",
        formUrlEncoded: "application/x-www-form-urlencoded",
        multiPart: "multipart/form-data"
    }

    static queryString = {
        SessionExpired: "SessionExpired=true",
        SessionKilled: "SessionKilled=true",
        me: "?me"
    }

    static localStorageKeys = {
        apiToken : "apiToken",
        isLoggedIn : "isLoggedIn",
        sessionId : "sessionId"
    }

    static contextTypes = {
        catalogContextType : 'c',
        masterCatalogContextType : 'm',
        siteContextType : 's'
    }

    static localization = {
        localizationAccessLink : 'localization',
        multiLang: 'multiLang',
        multCurrency: 'multCurrency'
    }

    static fatalErrorRedirectionUrl =
    {
        logout: '/admin/auth/logout',
    };

    static orderRoutingNavigationId = 'orderRouting';
    static fullfillerAccessibleLinks = ['order', 'fulfiller'];
    static fullfillerAccessibleSubLinks = ['orders', 'returns', 'fulfiller', 'ordersmenu', 'returnsmenu'];
}