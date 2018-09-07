namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductSortDefinitions
{
    public class ProductSortPosition
    {
        public string ProductCode { get; set; }

        public int? Position { get; set; }

        public bool? IsRanked { get; set; }

        public bool? IsPinned { get; set; }

        public bool? IsBuried { get; set; }
    }
}