using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Customers
{
    public class CustomerPurchaseOrderAccount
    {
        private List<PurchaseOrderPaymentTerm> _paymentTerms;

        [DataMember(Name = "accountId")]
        public int AccountId { get; set; }
        [DataMember(Name = "availableBalance")]
        public decimal AvailableBalance { get; set; }
        [DataMember(Name = "creditLimit")]
        public decimal CreditLimit { get; set; }
        [DataMember(Name = "paymentTerms")]
        public List<PurchaseOrderPaymentTerm> PaymentTerms
        {
            get { return _paymentTerms ?? (_paymentTerms = new List<PurchaseOrderPaymentTerm>()); }
            set { _paymentTerms = value; }
        }
        [DataMember(Name = "id")]
        public int Id { get; set; }
        [DataMember(Name = "isEnabled")]
        public bool IsEnabled { get; set; }
    }

    public class PurchaseOrderPaymentTerm
    {
        [DataMember(Name = "code")]
        public string Code { get; set; }
        [DataMember(Name = "Description")]
        public string Description { get; set; }
        [DataMember(Name = "siteId")]
        public int SiteId { get; set; }
    }
}
