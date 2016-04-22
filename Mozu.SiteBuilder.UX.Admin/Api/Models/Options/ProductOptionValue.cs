using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Product;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Options
{
    /// <summary>
    /// A value of a product option for this product. For example, a computer product may have an option called "Memory" that can have the values "6GB,"8GB," and "12GB."
    /// </summary>
    
    public class ProductOptionValue
    {
        public object Value { get; set; }

        public AttributeVocabularyValue AttributeVocabularyValueDetail { get; set; }
    }
}
