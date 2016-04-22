using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.PriceLists
{
    public class RuntimePriceList
    {
        public string Code { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        /// <summary>
        /// When true, only products with valid price list entries will be visible in the storefront. Default is false
        /// </summary>
        [DataMember(EmitDefaultValue = false)]
        public bool FilteredInStorefront { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public bool? Resolvable { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public bool? IsSiteDefault { get; set; }
    }
}