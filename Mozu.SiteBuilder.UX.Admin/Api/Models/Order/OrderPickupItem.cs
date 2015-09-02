using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    public class OrderPickupItem : AbstractOrderPackageItem
    {
        public string FulfillmentMethod { get; set; }

        public string FulfillmentLocationCode { get; set; }
    }
}
