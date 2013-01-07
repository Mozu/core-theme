using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.StoreFront.Cart
{
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
        public decimal? Price { get; set; }
    }
}
