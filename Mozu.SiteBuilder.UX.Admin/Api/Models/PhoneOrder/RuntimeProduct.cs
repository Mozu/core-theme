using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.PhoneOrder
{
    /// <summary>
    /// A Product not intended to be configured, not edited.
    /// Like the kind you put in a shopping cart.
    /// </summary>
    [DataContract]
    public class RuntimeProduct
    {
        [DataMember]
        public string Name { get; set; }

        [DataMember]
        public string FullDescription { get; set; }
    }
}