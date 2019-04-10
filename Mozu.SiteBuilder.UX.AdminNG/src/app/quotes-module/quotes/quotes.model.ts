// export class QuotesModel{
//     QuoteList: QuoteData[];
// }

// export class QuoteData{
//     b2bAccountName: string;
//     quoteName: string;
//     buyerName: string;
//     status: string;
//     lastModifiedDate: Date;
//     quoteTotal: number;
// }


export class QuotesModel {
    startIndex: number;
    pageSize: number;
    pageCount: number;
    totalCount: number;
    items: QuoteItem[];
  }
  
export class QuoteItem {
    id: string;
    name: string;
    siteId: number;
    tenantId: number;
    number: number;
    items: any[];
    auditInfo: AuditInfo;
    destinations: any[];
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
  }
  
export class AuditInfo {
    updateDate: string;
    createDate: string;
    updateBy: string;
    createBy: string;
  }
