using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Customers
{
    [DataContract]
    public class PasswordInfo
    {
        [DataMember(Name="oldPassword")]
        public string OldPassword { get; set; }

        [DataMember(Name = "newPassword")]
        public string NewPassword { get; set; }
    }
}
