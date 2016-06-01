using System;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    public class CustomerPurchaseOrderTransaction
    {
        public string AdditionalTransactionDetail { get; set; }
        public decimal AvailableBalance { get; set; }
        public decimal CreditLimit { get; set; }
        public int CustomerPurchaseOrderAccountId { get; set; }
        public string OrderId { get; set; }
        public string PurchaseOrderNumber { get; set; }
        public int SiteId { get; set; }
        public string OrderType { get; set; }
        public string OrderNumber { get; set; }
        public int TenantId { get; set; }
        public decimal TransactionAmount { get; set; }
        public DateTime TransactionDate { get; set; }
        public string TransactionDescription { get; set; }
        public int TransactionTypeId { get; set; }
    }
}