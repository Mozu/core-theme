
export class AccountInfoModel {
    users: User[];
    isActive: boolean;
    priceList: string;
    customerSet: string;
    companyOrOrganization: string;
    attributes: Attribute[];
    taxExempt: string;
    taxId: string;
    externalId: string;
    customerSinceDate: Date;
    accountType: string;
}
export class User {
    emailAddress: string;
    userName: string;
    firstName: string;
    lastName: string;
    localeCode: string;
    userId: string;
    isLocked: boolean;
    isActive: boolean;
    isRemoved: boolean;
    acceptsMarketing: boolean;
    hasExternalPassword: boolean;
}

export class Value {
}

export class Attribute {
    attributeDefinitionId: string;
    values: Value[];
}

// B2B Account List Model
export class B2BAccountListModel {
    success: boolean;
    total: number;
    items: B2BItem[];
}


export class AuditInfo {
    updateDate: Date;
    createDate: Date;
    updateBy: string;
    createBy: string;
}

export class Segment {
    id: number;
    code: string;
    name: string;
    description: string;
    auditInfo: AuditInfo;
}

export class Contact {
    accountId: number;
    isShipping: boolean;
    isPrimaryShipping: boolean;
    isBilling: boolean;
    isPrimaryBilling: boolean;
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    address1: string;
    address2: string;
    cityOrTown: string;
    countryCode: string;
    postalOrZipCode: string;
    stateOrProvince: string;
    addressIsValidated: boolean;
    addressType: string;
    homePhone: string;
}

export class B2BUser {
    emailAddress: string;
    userName: string;
    firstName: string;
    lastName: string;
    localeCode: string;
    userId: string;
    isLocked: boolean;
    isActive: boolean;
    isRemoved: boolean;
    hasExternalPassword: boolean;
}

export class B2BItem {
    isPoEnabled: boolean;
    id: number;
    customerSet: string;
    segments: Segment[];
    contacts: Contact[];
    companyOrOrganization: string;
    isActive: boolean;
    attributes: any[];
    notes: any[];
    taxExempt: boolean;
    visitCount: number;
    siteId: number;
    totalSpent: number;
    orderCount: number;
    wishlistCount: number;
    createDate: Date;
    segmentIds: number[];
    isLocked: boolean;
    isDisabled: boolean;
    customerSinceDate: Date;
    users: B2BUser[];
    priceList: string;
}

