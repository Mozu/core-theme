export interface Activity {
    isPasswordChangeRequired: boolean;
    lastPasswordChangeOn: Date;
    isLocked: boolean;
    failedLoginAttemptCount: number;
    remainingLoginAttempts: number;
    lastLoginOn: Date;
    createdOn: Date;
    updatedOn: Date;
}

export interface CtUser {
    behaviorIds: number[];
    email: string;
    expiration: Date;
    id: string;
    isAuthenticated: boolean;
    firstName: string;
    lastName: string;
    activity: Activity;
    isFulfillerUser: boolean;
}

export interface AssignedInScope {
    type: string;
    id: number;
}

export interface AuditInfo {
    updateDate: Date;
    createDate: Date;
    updateBy: string;
    createBy: string;
}

export interface CtUserRole {
    userId: string;
    assignedInScope: AssignedInScope;
    roleId: number;
    roleName: string;
    auditInfo: AuditInfo;
}

export interface Domain {
    domainName: string;
    zone: string;
    createDate: Date;
    updateDate: Date;
    isPrimary: boolean;
    isInfrastructureRecord: boolean;
    isSystemAssigned: boolean;
    isDomainManaged: boolean;
    cName: string;
    tenantId: number;
}

export interface Site {
    tenantId: number;
    masterCatalogId: number;
    catalogId: number;
    countryCode: string;
    defaultLocaleCode: string;
    defaultCurrencyCode: string;
    isMozuRendered: boolean;
    domains: Domain[];
    attributes: any[];
    createDate: Date;
    isDeleted: boolean;
    deleteDate: Date;
    updateDate: Date;
    status: string;
    id: number;
    name: string;
    localeCode:      string;
    currencyCode:    string;
}

export interface Catalog {
    tenantId: number;
    masterCatalogId: number;
    defaultLocaleCode: string;
    defaultCurrencyCode: string;
    createDate: Date;
    isDeleted: boolean;
    deleteDate: Date;
    updateDate: Date;
    status: string;
    id: number;
    name: string;
}

export interface MasterCatalog {
    tenantId: number;
    defaultLocaleCode: string;
    defaultCurrencyCode: string;
    catalogs: Catalog[];
    createDate: Date;
    isDeleted: boolean;
    deleteDate: Date;
    updateDate: Date;
    status: string;
    id: number;
    name: string;
}

export interface Domain2 {
    domainName: string;
    zone: string;
    createDate: Date;
    updateDate: Date;
    isPrimary: boolean;
    isInfrastructureRecord: boolean;
    isSystemAssigned: boolean;
    isDomainManaged: boolean;
    cName: string;
    tenantId: number;
}

export interface CtTenant {
    scaleUnitId: string;
    devAccountId: number;
    isDevTenant: boolean;
    sites: Site[];
    masterCatalogs: MasterCatalog[];
    domain: Domain2;
    supportsCustomExtensions: boolean;
    mozuInstanceId: string;
    attributes: any[];
    createDate: Date;
    isDeleted: boolean;
    deleteDate: Date;
    updateDate: Date;
    status: string;
    id: number;
    name: string;
}

export interface CtMasterCatalog {
    id: number;
    name: string;
    productPublishingMode: string;
    enableLiveEdit: boolean;
}

export interface CtEntity {
    path: string[];
    href: string;
    appId: string;
    windowTitle: string;
    location: string;
    displayMode: string;
    _id: string;
}

export interface Field {
    name: string;
    target: string;
    type: string;
}

export interface View {
    name: string;
    usages: string[];
    metadata?: any;
    isVisibleInStorefront: boolean;
    filter: string;
    fields: Field[];
    metaData?: any;
    security?: any;
    defaultSort?: any;
}

export interface IdProperty {
    propertyName: string;
    dataType: string;
}

export interface IndexA {
    propertyName: string;
    dataType: string;
}

export interface IndexB {
    propertyName: string;
    dataType: string;
}

export interface IndexC {
    propertyName: string;
    dataType: string;
}

export interface IndexD {
    propertyName: string;
    dataType: string;
}

export interface CustomSchema {
    name: string;
    namespace: string;
    listFQN: string;
    documentTypes: string[];
    supportsPublishing: boolean;
    enablePublishing?: boolean;
    supportsActiveDateRanges: boolean;
    enableActiveDateRanges: boolean;
    views: View[];
    usages: string[];
    security: string;
    scopeId: number;
    scopeType: string;
    documentListType: string;
    metadata?: any;
    entityType: string;
    tenantId?: number;
    nameSpace: string;
    contextLevel: string;
    useSystemAssignedId?: boolean;
    idProperty: IdProperty;
    indexA: IndexA;
    indexB: IndexB;
    indexC: IndexC;
    indexD: IndexD;
    isVisibleInStorefront?: boolean;
    isLocaleSpecific?: boolean;
    isShopperSpecific?: boolean;
    isSandboxDataCloningSupported?: boolean;
    createDate?: Date;
    updateDate?: Date;
    listName: string;
}

export interface SystemData {
    lastPasswordChangeOn: Date;
    remainingLoginAttempts: number;
    lastLoginOn: Date;
    createdOn: Date;
    updatedOn: Date;
}

export interface CtSiteUser {
    emailAddress: string;
    localeCode: string;
    firstName: string;
    lastName: string;
    id: string;
    systemData: SystemData;
    isActive: boolean;
}

export interface Site2 {
    id: number;
    name: string;
    stagingHost: string;
    masterCatalogId: number;
    catalogId: number;
    isMozuRendered: boolean;
    localeCode: string;
    currencyCode: string;
}

export interface Catalog2 {
    id: number;
    name: string;
    localeCode: string;
    currencyCode: string;
    masterCatalogId: number;
}

export interface MasterCatalog2 {
    id: number;
    name: string;
    productPublishingMode: string;
    sites: Site2[];
    catalogs: Catalog2[];
    localeCode: string;
    currencyCode: string;
    enableLiveEdit: boolean;
}

export interface Usd {
    currencyCode: string;
    englishName: string;
    symbol: string;
    precision: number;
    roundingType: string;
}

export interface Currencies {
    usd: Usd;
}

export interface CtTaContext {
    id: number;
    name: string;
    masterCatalogs: MasterCatalog2[];
    currencies: Currencies;
    logzuUrl: string;
    omsEnabled: boolean;
    hasLegacyAdmin: boolean;
}

export interface LocalizationValue {
    key: string;
    value: string;
}

export interface Items {
    ctUser: CtUser;
    ctUserRoles: CtUserRole[];
    ctTenant: CtTenant;
    ctMasterCatalogs: CtMasterCatalog[];
    ctEntities: CtEntity[];
    customSchema: CustomSchema[];
    ctSiteUsers: CtSiteUser[];
    ctTaContext: CtTaContext;
    localizationValues: LocalizationValue[];
    useGoogleAnalytics: string;
    googleAnalyticsAccount: string;
    showBristReport: string;
    loginUri: string;
}

export interface SharedData {
    success: boolean;
    total: number;
    items: Items;
}
