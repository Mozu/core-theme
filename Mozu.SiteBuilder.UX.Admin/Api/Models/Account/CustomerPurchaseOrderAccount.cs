using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Mozu.Customer.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    public class CustomerPurchaseOrderAccount
    {
        public int AccountId { get; set; }
        public decimal AvailableBalance { get; set; }
        public decimal CreditLimit { get; set; }
        public List<PurchaseOrderPaymentTerm> CustomerPurchaseOrderPaymentTerms { get; set; }
        public int Id { get; set; }
        public bool IsEnabled { get; set; }
        public string OverdraftAllowance { get; set; }
        public decimal? OverdraftAllowanceType { get; set; }
    }

    public class PurchaseOrderPaymentTerm
    {
        public string Code { get; set; }
        public string Description { get; set; }
        public int SiteId { get; set; }
        public int Id { get; set; }
    }
}