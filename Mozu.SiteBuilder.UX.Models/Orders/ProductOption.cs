using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Orders
{
    [DataContract]
    public class ProductOption : ModelBase
    {
        [DataMember(Name = "productOptionValueId")]
        public int? ProductOptionValueId { get; set; }

        [DataMember(Name = "optionName")]
        public string OptionName { get; set; }

        [DataMember(Name = "optionValue")]
        public string OptionValue { get; set; }

        [DataMember(Name = "shopperEnteredValue")]
        public string ShopperEnteredValue { get; set; }
    }
}
