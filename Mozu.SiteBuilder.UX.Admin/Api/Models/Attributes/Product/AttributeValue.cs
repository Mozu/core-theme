using System.Collections.Generic;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Product
{

    public class AttributeValue
    {
        public object Id { get; set; }

        public string AttributeFQN { get; set; }

        public object Value { get; set; }

        public string LocaleCode { get; set; }

        /// <summary>
        /// Used to store original product name if overriden
        /// </summary>
        public string OptionalValue { get; set; }

        public bool IsOverriden { get; set; }

        public int? ValueSequence { get; set; }

        public List<object> MappedGenericValues { get; set; }
    }
}
