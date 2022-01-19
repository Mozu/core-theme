using System;
using System.Collections.Generic;
using DCReturns = Mozu.CommerceRuntime.Contracts.Returns;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Models
{
    public class Return : DCReturns.Return
    {
        public List<ReturnRefund> ReturnRefunds { get; set; }
    }

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
        public string CCLastFour { get; set; }
        public DateTime? CreateDate { get; set; }
        public string CreateBy { get; set; }
    }
}
