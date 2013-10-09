using System.Collections.Generic;
using System.Runtime.Serialization;
using Mozu.SiteBuilder.UX.Models.Orders;

namespace Mozu.SiteBuilder.UX.Models.StoreFront.Cart
{
    [DataContract]
    public class ProductPrice
    {
        [DataMember(Name = "Price")]
        public decimal? Price { get; set; }

        [DataMember(Name = "SalePrice")]
        public decimal? SalePrice { get; set; }

        //[DataMember(Name = "Discount")]
        //public AppliedDiscount Discount { get; set; }
    }

    [DataContract]
    public class Product
    {
        [DataMember(Name = "Name")]
        public string Name { get; set; }

        [DataMember(Name = "Description")]
        public string Description { get; set; }

        //[DataMember(Name = "imageAlternateText")]
        //public string ImageAlternateText { get; set; }

        //[DataMember(Name = "imagePath")]
        //public string ImagePath { get; set; }

        [DataMember(Name = "ProductCode")]
        public string ProductCode { get; set; }

        [DataMember(Name = "VariationProductCode")]
        public string VariationProductCode { get; set; }

        [DataMember(Name = "options")]
        public List<ProductOption> Options { get; set; }

        [DataMember(Name = "price")]
        public ProductPrice Price { get; set; }
    }
}
