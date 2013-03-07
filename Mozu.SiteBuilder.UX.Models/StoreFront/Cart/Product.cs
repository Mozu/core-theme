using System.Collections.Generic;
using System.Runtime.Serialization;
using Mozu.SiteBuilder.UX.Models.Orders;

namespace Mozu.SiteBuilder.UX.Models.StoreFront.Cart
{
    [DataContract]
    public class ProductPrice
    {
        [DataMember(Name = "price")]
        public decimal? Price { get; set; }

        [DataMember(Name = "salePrice")]
        public decimal? SalePrice { get; set; }

        [DataMember(Name = "discount")]
        public AppliedDiscount Discount { get; set; }
    }

    [DataContract]
    public class Product
    {
        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "description")]
        public string Description { get; set; }

        [DataMember(Name = "imageAlternateText")]
        public string ImageAlternateText { get; set; }

        [DataMember(Name = "imagePath")]
        public string ImagePath { get; set; }

        [DataMember(Name = "productCode")]
        public string ProductCode { get; set; }

        [DataMember(Name = "variationProductCode")]
        public string VariationProductCode { get; set; }

        [DataMember(Name = "options")]
        public List<ProductOption> Options { get; set; }

        [DataMember(Name = "price")]
        public ProductPrice Price { get; set; }
    }
}
