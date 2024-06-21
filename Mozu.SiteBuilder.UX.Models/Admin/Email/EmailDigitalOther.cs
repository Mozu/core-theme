using Mozu.CommerceRuntime.Contracts.Orders;
using Fulfillment = Kibo.Fulfillment.Contracts.Model;

namespace Mozu.SiteBuilder.UX.Models.Admin.Email
{
    public class DigitalOtherPublishedContent
    {
        public string OrderId { get; set; }
        public int ShipmentNumber { get; set; }
        public string GiftMessage { get; set; }
        public Fulfillment.Item DigitalItem { get; set; }
    }

    public class EmailDigitalOther : DigitalOtherPublishedContent
    {
        public Order Order { get; set; }
    }
}
