import { NegotiatedPriceDiscount } from '@shared';

export class QuoteItemModel {
    id: string;
    quoteNumber: number;
    name: string;
    siteId: number;
    tenantId: number;
    status: string;
    submittedDate: string;
    number: number;
    items: Item[];
    auditInfo: AuditInfo;
    expirationDate: Date;
    userId: string;
    destinations: Destination[];
    customerAccountId: number;
    isTaxExempt: boolean;
    currencyCode: string;
    customerInteractionType: string;
    orderDiscounts: any[];
    subTotal: number;
    itemLevelProductDiscountTotal: number;
    orderLevelProductDiscountTotal: number;
    itemTaxTotal: number;
    itemTotal: number;
    total: number;
    shippingDiscounts: any[];
    itemLevelShippingDiscountTotal: number;
    orderLevelShippingDiscountTotal: number;
    shippingAmount: number;
    shippingSubTotal: number;
    shippingTax: number;
    shippingTaxTotal: number;
    shippingTotal: number;
    handlingDiscounts: any[];
    itemLevelHandlingDiscountTotal: number;
    orderLevelHandlingDiscountTotal: number;
    handlingSubTotal: number;
    handlingTax: number;
    handlingTaxTotal: number;
    handlingTotal: number;
    dutyTotal: number;
    feeTotal: number;
    accountName: string;
    accountUser: string;
    submitDate: string;
    projectName: string;
    shippingMethodName: string;
    shippingMethodCode: string;
    subtotalOption: string;
    subtotalOptionValue: number;
    extendedTotal: number;
    negotiatedPriceDiscount: NegotiatedPriceDiscount;
    negotiatedPriceDiscountValue: number;
}


export class Category {
    id: number;
}

export class Price {
    price: number;
}

export class Height {
    unit: string;
    value: number;
}

export class Width {
    unit: string;
    value: number;
}

export class Length {
    unit: string;
    value: number;
}

export class Weight {
    unit: string;
    value: number;
}

export class Measurements {
    height: Height;
    width: Width;
    length: Length;
    weight: Weight;
}

export class Product {
    fulfillmentTypesSupported: string[];
    options: any[];
    properties: any[];
    categories: Category[];
    price: Price;
    discountsRestricted: boolean;
    isTaxable: boolean;
    productType: string;
    productUsage: string;
    bundledProducts: any[];
    productCode: string;
    name: string;
    goodsType: string;
    isPackagedStandAlone: boolean;
    measurements: Measurements;
    fulfillmentStatus: string;
}

export class UnitPrice {
    extendedAmount: number;
    listAmount: number;
}

export class ItemAuditInfo {
    createDate: Date;
    updateBy: string;
    createBy: string;
}

export class Item {
    id: string;
    destinationId: string;
    fulfillmentLocationCode: string;
    fulfillmentMethod: string;
    lineId: number;
    product: Product;
    quantity: number;
    subtotal: number;
    extendedTotal: number;
    taxableTotal: number;
    discountTotal: number;
    discountedTotal: number;
    itemTaxTotal: number;
    shippingTaxTotal: number;
    shippingTotal: number;
    feeTotal: number;
    total: number;
    unitPrice: UnitPrice;
    productDiscounts: any[];
    shippingDiscounts: any[];
    auditInfo: ItemAuditInfo;
    shippingAmountBeforeDiscountsAndAdjustments: number;
    weightedOrderDiscount: number;
    weightedOrderShippingDiscount: number;
    weightedOrderHandlingFeeDiscount: number;
}

export class AuditInfo {
    updateDate: Date;
    createDate: Date;
    updateBy: string;
    createBy: string;
}

export class PhoneNumbers {
    home: string;
}

export class Address {
    address1: string;
    cityOrTown: string;
    stateOrProvince: string;
    postalOrZipCode: string;
    countryCode: string;
    addressType: string;
    isValidated: boolean;
}

export class DestinationContact {
    firstName: string;
    lastNameOrSurname: string;
    phoneNumbers: PhoneNumbers;
    address: Address;
}

export class Destination {
    id: string;
    destinationContact: DestinationContact;
}

export class QuoteSubtotalModel {
    subTotalExclTax: number;
    subTotalInclTax: number;
    estimatedTax: number;
    totalCost: number;
    constructor() {
        this.subTotalExclTax = 0;
        this.subTotalInclTax = 0;
        this.estimatedTax = 0;
        this.totalCost = 0;
    }
}
