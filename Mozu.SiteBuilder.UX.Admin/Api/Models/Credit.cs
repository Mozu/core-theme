using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using DC = Mozu.Customer.Contracts.Credit;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models
{
    public class Credit
    {
        public DateTime? ActivationDate { get; set; }
        public string Code { get; set; }
        public string CreditType { get; set; }
        public string CurrencyCode { get; set; }
        public decimal InitialBalance { get; set; }
        public decimal CurrentBalance { get; set; }
        public int? CustomerId { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string IssuedBy { get; set; }
        public Mozu.SiteBuilder.UX.Admin.Api.Models.Customer  Customer { get; set; }
    }
}