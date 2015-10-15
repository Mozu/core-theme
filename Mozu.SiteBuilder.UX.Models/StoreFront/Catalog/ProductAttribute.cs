using System.Collections.Generic;

namespace Mozu.SiteBuilder.UX.Models.StoreFront.Catalog
{
    public class ProductAttribute : BaseProductAttribute
    {
        public bool IsMultiValue { get; set; }
        public List<ProductAttributeValue> Values { get; set; }
        public bool IsUsedForConfigurationOption { get; set; }
    }
}