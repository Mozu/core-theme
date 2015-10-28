using System;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Search
{
    public class SimpleSearchProduct
    {
        private sealed class CodeEqualityComparer : IEqualityComparer<SimpleSearchProduct>
        {
            public bool Equals(SimpleSearchProduct x, SimpleSearchProduct y)
            {
                if (ReferenceEquals(x, y)) return true;
                if (ReferenceEquals(x, null)) return false;
                if (ReferenceEquals(y, null)) return false;
                if (x.GetType() != y.GetType()) return false;
                return string.Equals(x.ProductCode, y.ProductCode);
            }

            public int GetHashCode(SimpleSearchProduct obj)
            {
                return (obj.ProductCode != null ? obj.ProductCode.GetHashCode() : 0);
            }
        }

        private static readonly IEqualityComparer<SimpleSearchProduct> CodeComparerInstance = new CodeEqualityComparer();

        public static IEqualityComparer<SimpleSearchProduct> CodeComparer
        {
            get { return CodeComparerInstance; }
        }

        public string ProductCode { get; set; }

        public string ProductName { get; set; }

        public decimal? Price { get; set; }

        public decimal? SalePrice { get; set; }
        public DateTime? LastModifiedDate { get; set; }

        public string ProductTypeName { get; set; }

        public string ProductUsage { get; set; }
        public int? ProductTypeId { get; set; }
    }
}