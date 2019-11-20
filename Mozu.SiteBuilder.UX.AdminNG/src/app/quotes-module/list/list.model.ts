import { MenuItem } from 'primeng/api';

export class QuotesListModel {
  startIndex: number;
  pageSize: number;
  pageCount: number;
  totalCount: number;
  items: QuoteItem[];
  selectedQuote: any;
  quoteGridContextMenuItem: MenuItem[];
  subscriptions: any[];
  advancedSearch: any;
  sortResult: any;
  sortField: string;
  sortOrder: string;
 }

export class QuoteItem {
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
  comments: string[];
  destinations: Destination[];
  userId: string;
  expirationDate: string;
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
  shippingTaxTotal: number;
  shippingTotal: number;
  handlingDiscounts: any[];
  itemLevelHandlingDiscountTotal: number;
  orderLevelHandlingDiscountTotal: number;
  handlingSubTotal: number;
  handlingTaxTotal: number;
  handlingTotal: number;
  dutyTotal: number;
  feeTotal: number;
  customerAccountId?: number;
  shippingTax?: number;
  handlingTax?: number;
  numberOfProducts: number;
  totalQuantity: number;
  accountName: string;
  accountUser: string;
  submitDate: string;
  projectName: string;
}

export class AuditInfo {
  updateDate: Date;
  createDate: Date;
  updateBy: string;
  createBy: string;
}

export class Category {
  id: number;
}

export class Price {
  price?: number;
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
  options: any[];
  properties: any[];
  categories: Category[];
  price: Price;
  bundledProducts: any[];
  productCode: string;
  name: string;
  goodsType: string;
  isPackagedStandAlone: boolean;
  fulfillmentStatus: string;
  fulfillmentTypesSupported: string[];
  discountsRestricted?: boolean;
  isTaxable?: boolean;
  productType: string;
  productUsage: string;
  measurements: Measurements;
}

export class ItemAuditInfo {
  createDate: Date;
  updateBy: string;
  createBy: string;
}

export class UnitPrice {
  extendedAmount: number;
  listAmount: number;
}

export class Item {
  id: string;
  QuoteNumber: number;
  fulfillmentMethod: string;
  lineId: number;
  product: Product;
  quantity: number;
  subtotal: number;
  extendedTotal: number;
  discountTotal: number;
  discountedTotal: number;
  feeTotal: number;
  total: number;
  productDiscounts: any[];
  shippingDiscounts: any[];
  auditInfo: ItemAuditInfo;
  destinationId: string;
  fulfillmentLocationCode: string;
  taxableTotal?: number;
  itemTaxTotal?: number;
  shippingTaxTotal?: number;
  shippingTotal?: number;
  unitPrice: UnitPrice;
  shippingAmountBeforeDiscountsAndAdjustments?: number;
  weightedOrderDiscount?: number;
  weightedOrderShippingDiscount?: number;
  weightedOrderHandlingFeeDiscount?: number;
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
