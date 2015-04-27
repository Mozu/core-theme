using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    public class OrderPickupItem
    {
        public int Quantity { get; set; }

        public string ProductName { get; set; }

        public string ProductCode { get; set; }

        public string FulfillmentMethod { get; set; }

        public string FulfillmentLocationCode { get; set; }

        public int LineId { get; set; }

        public string FulfillmentStatus { get; set; }
    }
}
