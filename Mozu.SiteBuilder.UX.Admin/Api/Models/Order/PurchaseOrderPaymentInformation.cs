using System.Collections.Generic;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    public class PurchaseOrderPaymentInformation
    {
        public int CustomerPurchaseOrderAccountId { get; set; }
        public string PurchaseOrderNumber { get; set; }
        public PurchaseOrderPaymentTerm PaymentTerm { get; set; }
        public List<PurchaseOrderCustomField> CustomFields { get; set; }

    }
}