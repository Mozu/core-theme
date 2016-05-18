using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    public class CustomerPurchaseOrderTransaction
    {
        public decimal CreditLimit { get; set; }
        public int CustomerPurchaseOrderAccountId { get; set; }
        public string OrderId { get; set; }
        public string OrderType { get; set; }
        public string PurchaseOrderNumber { get; set; }
        public int SiteId { get; set; }
        public decimal TransactionAmount { get; set; }
        public DateTime TransactionDate { get; set; }
        public string TransactionDetail { get; set; }
    }
}