using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Checkout
{
    [DataContract]
    public enum OrderStatus
    {
        [DataMember(Name = "incomplete")]
        Incomplete,
        [DataMember(Name = "invalid")]
        Invalid,
        [DataMember(Name = "complete")]
        Complete,
    }
}