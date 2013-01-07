using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Orders
{
    [DataContract]
    public class ShopperNotes : ModelBase
    {
        [DataMember(Name = "giftMessage")]
        public string GiftMessage { get; set; }

        [DataMember(Name = "comments")]
        public string Comments { get; set; }
    }
}