using System.Collections.Generic;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.PriceLists
{
    public class PriceListProduct
    {
        public string ProductCode { get; set; } 

        public List<PriceListEntry> Entries { get; set; }
    }
}