using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Mozu.SiteBuilder.UX.Models.Customers;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    public class PurchaseOrderPayment
    {
        public int CustomerPurchaseOrderAccountId { get; set; }
        public List <PurchaseOrderCustomField> CustomFields { get; set; }
        public PurchaseOrderPaymentTerm PaymentTerm { get; set; }
        public string PurchaseOrderNumber { get; set; }
    }

    public class PurchaseOrderCustomField
    {
        public string Code { get; set; }
        public string Label { get; set; }
        public string Value { get; set; }
    }

    public class PurchaseOrderPaymentTerm
    {
        public string Code { get; set; }
        public string Description { get; set; }
    }
}