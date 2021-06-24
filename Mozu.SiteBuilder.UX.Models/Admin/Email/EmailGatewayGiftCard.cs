using System;
using System.Collections.Generic;
using System.Text;

namespace Mozu.SiteBuilder.UX.Models.Admin.Email
{
    public class GatewayGiftCard
    {
        public string CardNumber { get; set; }

        public decimal Amount { get; set; }

        public string CurrencyCode { get; set; }

        public string GiftMessage { get; set; }

    }

    public class EmailGatewayGiftCard : GatewayGiftCard
    {
        public string CardPin { get; set; }

        public string OrderId { get; set; }

        public string ReturnId { get; set; }

        public string PaymentId { get; set; }
    }
}
