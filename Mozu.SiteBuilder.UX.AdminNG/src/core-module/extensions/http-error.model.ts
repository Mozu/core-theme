export enum ErroNotificationType {
    Dialog,
    Toaster,
    Swallow
}

export enum TostrMessageType {
    Error = <any>'Error',
    Warning = <any>'Warning',
    Information = <any>'Information',
    Success = <any>'Success',
    Custom = <any>'Custom'
}

export enum ErrorCode {
    Swallow = <any>'None',
    Fatal = <any>'Fatal',

    BR001 = <any>'BR001',
    BR002 = <any>'BR002',

    AuthFailedInvalidAuthResponse = <any>'AuthFailedInvalidAuthResponse',
    UserSessionExpired = <any>'UserSessionExpired',
    DashboardTilesGetFailed= <any>'DashboardTilesGetFailed',
    QuoteListGetFailed= <any>'QuoteListGetFailed',
    QuoteGetFailed= <any>'QuoteGetFailed',
    GetAccountInfoFailed= <any>'GetAccountInfoFailed',
    LocationsGetFailed = <any>'LocationsGetFailed',
    LocationGroupsListGetFailed = <any>'LocationGroupsListGetFailed',
    GetLocationGroupDetailFailed = <any>'GetLocationGroupDetailFailed',
    fetchCapabilitiesForSecureFormGetFailed= <any>'fetchCapabilitiesForSecureFormGetFailed',
    EmptyLocationGroupName= <any> 'EmptyLocationGroupName',
    EmptyLocationGroupSites= <any> 'EmptyLocationGroupSites',
    EmptyLocationGroupCodes= <any> 'EmptyLocationGroupCodes'
}

export enum ToastrCode {
    EmptyEmailAddress = <any>'EmptyEmailAddress',
    EmptyPassword = <any>'EmptyPassword'
}

export class HttpError {
    code: ErrorCode;
    public messageParams: any;
    error: any;
    erroNotificationType: ErroNotificationType;
    constructor(cd: ErrorCode, notificationType: ErroNotificationType, err: any = null, messageParams: any = null) {
        this.code = cd;
        this.error = err;
        this.erroNotificationType = notificationType;
        this.messageParams = messageParams;
    }
}

export class ToastrMessage {
    messageType: TostrMessageType;
    message: string;
}
