using Mozu.Core.Api.Contracts;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Models
{
    public class DetailedShipmentItem : CommerceRuntime.Contracts.Fulfillment.ShipmentItem
    {
        public Measurement AdjustedWeight { get; set; }
        public string ProductName { get; set; }
    }
}