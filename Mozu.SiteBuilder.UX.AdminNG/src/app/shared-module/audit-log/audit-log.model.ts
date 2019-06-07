export class AuditLogModel {
    startIndex: number;
    pageSize: number;
    pageCount: number;
    totalCount: number;
    items: Item[];
}

    export class PhoneNumbers {
        Home: string;
        Mobile: string;
        Work: string;
    }

    export class Address {
        Address1: string;
        Address2: string;
        Address3: string;
        Address4: string;
        CityOrTown: string;
        StateOrProvince: string;
        PostalOrZipCode: string;
        CountryCode: string;
        AddressType: string;
        IsValidated: boolean;
    }

    export class FulfillmentContact {
        Email: string;
        FirstName: string;
        MiddleNameOrInitial: string;
        LastNameOrSurname: string;
        CompanyOrOrganization: string;
        PhoneNumbers: PhoneNumbers;
        Address: Address;
    }

    export class AuditInfo {
        UpdateDate: Date;
        CreateDate: Date;
        UpdateBy: string;
        CreateBy: string;
    }

    export class UpdatedFulfillment {
        FulfillmentContact: FulfillmentContact;
        ShippingMethodCode?: any;
        ShippingMethodName?: any;
        IsDestinationCommercial?: any;
        Data?: any;
        AuditInfo: AuditInfo;
    }

    export class Metadata {
        oldValue: string;
        newValue: string;
        updatedFulfillment: UpdatedFulfillment;
        oldPriceListCode?: any;
        newPriceListCode: string;
    }

    export class Item {
        id: string;
        correlationId: string;
        subjectType: string;
        success: boolean;
        identifier: string;
        subject: string;
        verb: string;
        message: string;
        metadata: Metadata[];
        oldValue: string;
        newValue: string;
        createDate: Date;
        userId: string;
        userFirstName: string;
        userLastName: string;
        userScopeType: string;
        appId: string;
        appKey: string;
    }


