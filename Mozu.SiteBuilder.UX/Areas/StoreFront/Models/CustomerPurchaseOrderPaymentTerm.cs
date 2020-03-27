using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Models
{
    public class CustomerPurchaseOrderPaymentTerm : Customer.Contracts.CustomerPurchaseOrderPaymentTerm

    {
        public CustomerPurchaseOrderPaymentTerm (Customer.Contracts.CustomerPurchaseOrderPaymentTerm paymentTerm, string newDescription)
        {
            Code = paymentTerm.Code;
            Description = newDescription;
        }
    }
}