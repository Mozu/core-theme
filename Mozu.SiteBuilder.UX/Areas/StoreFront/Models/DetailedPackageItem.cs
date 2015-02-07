using Mozu.Core.Api.Contracts;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Models
{
    public class DetailedPackageItem : CommerceRuntime.Contracts.Fulfillment.PackageItem
    {
        public Measurement AdjustedWeight { get; set; }
        public string ProductName { get; set; }
    }
}