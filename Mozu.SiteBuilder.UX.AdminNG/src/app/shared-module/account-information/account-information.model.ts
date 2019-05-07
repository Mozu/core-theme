
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

