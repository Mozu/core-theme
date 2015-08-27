using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using System.Text;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    /// <summary>
    /// Data contract for creating a new payment.
    /// </summary>
    
    public class CardPaymentInformation
    {
        public string NameOnCard { get; set; }

        public string CardType { get; set; }

        public string CardNumber { get; set; }

        public string PaymentServiceCardId { get; set; }

        public short ExpireMonth { get; set; }

        public short ExpireYear { get; set; }

        public bool IsSameBillingShippingAddress { get; set; }
    }
}
