using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Customers
{
    [DataContract]
    public class CommerceSummary
    {
        private CurrencyAmount _totalOrderAmount;

        [DataMember(Name = "totalOrderAmount")]
        public CurrencyAmount TotalOrderAmount
        {
            // This isn't populated by the service, do this so the UI has something to use for now.
            get { return _totalOrderAmount ?? (_totalOrderAmount = new CurrencyAmount()); }
            set { _totalOrderAmount = value; }
        }

        [DataMember(Name = "orderCount")]
        public int OrderCount { get; set; }

        [DataMember(Name = "lastOrderedOn")]
        public DateTime? LastOrderedOn { get; set; }
    }
}