using System;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    public class OrderPackageItem : AbstractOrderPackageItem
    {
        public string FulfillmentMethod { get; set; }
        public string FulfillmentLocationCode { get; set; }
        public bool IsPackagedStandAlone { get; set; }
    }
}
