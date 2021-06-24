using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.CommerceRuntime.Contracts.Orders;
using Fulfillment = Kibo.Fulfillment.Contracts.Model;


namespace Mozu.SiteBuilder.UX.Models.Admin.Email
{
    public class GiftCardEmailOrderCredit
    {
        public Order Order { get; set; }
        public Fulfillment.EntityModelOfShipment Shipment { get; set; }
       public Mozu.Customer.Contracts.Credit.Credit Credit { get; set; }
        public string GiftMessage { get; set; }
    }
}
