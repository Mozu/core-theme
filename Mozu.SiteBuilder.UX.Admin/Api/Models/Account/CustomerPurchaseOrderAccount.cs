using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Mozu.Customer.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    public class CustomerPurchaseOrderAccount
    {
        public decimal AvailableBalance { get; set; }
        public decimal CreditLimit { get; set; }
        public List<PurchaseOrderPaymentTerm> CustomerPurchaseOrderPaymentTerms { get; set; }
        public int Id { get; set; }
        public bool IsEnabled { get; set; }
        public string OverdraftType { get; set; }
        public decimal? OverdraftValue { get; set; }
    }

    public class PurchaseOrderPaymentTerm
    {
        public string Description { get; set; }
        public int SiteId { get; set; }
    }
}