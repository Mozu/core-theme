using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Returns
{
    public class ReturnRefund
    {
        public string Id { get; set; }
        public decimal? RefundAmount { get; set; }
        public string ReturnId { get; set; }
        public string RefundId { get; set; }

        public string PaymentType { get; set; }
        public string CardType { get; set; } 
        public string CardNumber { get; set; } 
        public string NameOnCard { get; set; }
        public string TokenType { get; set; }

        public DateTime? CreateDate { get; set; }
        public string CreateBy { get; set; }
    }
}