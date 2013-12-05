using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using DC = Mozu.Customer.Contracts.Credit;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models
{
    public class Credit
    {
//        public int id { get; set; }
        // WAS: dateIssued?
        public DateTime? ActivationDate { get; set; }
        public string Code { get; set; }
        public string CreditType { get; set; }
        public string CurrencyCode { get; set; }
        //  WAS: issuedAmount?
        public decimal InitialBalance { get; set; }
        //  WAS: balance
        public decimal CurrentBalance { get; set; }
        public int CustomerId { get; set; }
        //  customerName
        public string CustomerName { get; set; }
        // WAS: expires
        public DateTime? ExpirationDate { get; set; }
        //  modifiedDate
        public DateTime? ModifiedDate { get; set; }
        // issuedBy
        public string IssuedBy { get; set; }
        // email

    }
}