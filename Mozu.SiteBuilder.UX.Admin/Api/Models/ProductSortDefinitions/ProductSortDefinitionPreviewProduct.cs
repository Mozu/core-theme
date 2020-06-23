using Mozu.SiteBuilder.Mvc.Extensions;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductSortDefinitions
{
    [JsonObject]
    public class ProductSortDefinitionPreviewProduct : Storefront.StorefrontProduct
    {
        public int? Position { get; set; }

        public bool? IsRanked { get; set; }

        public bool? IsPinned { get; set; }

        public bool? IsBuried { get; set; }

        public bool? NotAvailableInStorefront{ get; set; }

        public string UniqueKey =>
            ProductCode +
            (SliceValue.IsNullOrEmpty()
                ? string.Empty
                : $"{SliceValue}");

        //public string ImageUrl { get; set; }
    }
}