using Mozu.SiteBuilder.Mvc.Extensions;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductSortDefinitions
{
    public class ProductSortPosition
    {
        public string ProductCode { get; set; }
        
        public string SliceValue { get; set; }

        private string _uniqueKey;
        public string UniqueKey
        {
            get =>
                _uniqueKey ??
                (_uniqueKey = MakeUniqueKey(ProductCode, SliceValue));

            set => _uniqueKey = value;
        }

        public static string MakeUniqueKey(string productCode, string sliceValue)
        {
            return $"{productCode}{sliceValue}";
        }

        public int? Position { get; set; }

        public bool? IsRanked { get; set; }

        public bool? IsPinned { get; set; }

        public bool? IsBuried { get; set; }
    }
}