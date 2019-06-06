export class AuditLogModel {
    success: boolean;
    total: number;
    items: Item[];
}

    export class PhoneNumbers {
        Home: string;
        Mobile: string;
    }

    export class Address {
        Address1: string;
        Address2?: any;
        Address3?: any;
        Address4?: any;
        CityOrTown: string;
        StateOrProvince: string;
        PostalOrZipCode: string;
        CountryCode: string;
        AddressType: string;
        IsValidated: boolean;
    }

    export class FulfillmentContact {
        Id: number;
        Email: string;
        FirstName: string;
        LastNameOrSurname: string;
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
        ShippingMethodCode: string;
        ShippingMethodName: string;
        IsDestinationCommercial?: any;
        Data?: any;
        AuditInfo: AuditInfo;
    }

    export class PhoneNumbers2 {
        Home: string;
        Mobile: string;
    }

    export class Address2 {
        Address1: string;
        Address2?: any;
        Address3?: any;
        Address4?: any;
        CityOrTown: string;
        StateOrProvince: string;
        PostalOrZipCode: string;
        CountryCode: string;
        AddressType: string;
        IsValidated: boolean;
    }

    export class FulfillmentContact2 {
        Id: number;
        Email: string;
        FirstName: string;
        LastNameOrSurname: string;
        PhoneNumbers: PhoneNumbers2;
        Address: Address2;
    }

    export class AuditInfo2 {
        UpdateDate: Date;
        CreateDate: Date;
        UpdateBy: string;
        CreateBy: string;
    }

    export class OriginalFulfillment {
        FulfillmentContact: FulfillmentContact2;
        ShippingMethodCode?: any;
        ShippingMethodName?: any;
        IsDestinationCommercial?: any;
        Data?: any;
        AuditInfo: AuditInfo2;
    }

    export class Metadata {
        transactionId: string;
        paymentServiceTransactionId?: any;
        paymentType: string;
        amountCollected: number;
        amountCredited: number;
        amountRequested: number;
        oldValue: string;
        newValue: string;
        updatedFulfillment: UpdatedFulfillment;
        originalFulfillment: OriginalFulfillment;
    }

    export class Item {
        id: string;
        correlationId: string;
        userId: string;
        userFirstName: string;
        userLastName: string;
        userScopeType: string;
        appId: string;
        appKey: string;
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
    }





