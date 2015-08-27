using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Customers
{
    [DataContract]
    public class Phone
    {
        [DataMember(Name = "home")]
        public string Home { get; set; }

        [DataMember(Name = "work")]
        public string Work { get; set; }

        [DataMember(Name = "mobile")]
        public string Mobile { get; set; }
    }
}