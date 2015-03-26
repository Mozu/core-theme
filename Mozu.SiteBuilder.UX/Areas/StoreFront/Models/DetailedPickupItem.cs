using Mozu.CommerceRuntime.Contracts.Fulfillment;
using Mozu.Core.Api.Contracts;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Models
{
    public class DetailedPickupItem : PickupItem
    {
        public Measurement AdjustedWeight { get; set; }
        public string ProductName { get; set; }
    }
}