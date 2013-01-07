using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Orders
{
    [DataContract]
    public class Product : ModelBase
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

        [DataMember(Name = "categories")]
        public List<Category> Categories { get; set; }

        [DataMember(Name = "price")]
        public ProductPrice Price { get; set; }

        [DataMember(Name = "measurements")]
        public PackageMeasurements Measurements { get; set; }

        [DataMember(Name = "isRecurring")]
        public bool? IsRecurring { get; set; }

        [DataMember(Name = "isTaxable")]
        public bool? IsTaxable { get; set; }

        [DataMember(Name = "stock")]
        public ProductStock Stock { get; set; }

        [DataMember(Name = "productType")]
        public string ProductType { get; set; }
    }
}
