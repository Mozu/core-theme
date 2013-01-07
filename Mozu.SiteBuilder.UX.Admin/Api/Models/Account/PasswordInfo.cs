using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    [DataContract]
    public class PasswordInfo
    {
        [DataMember(Name = "newPassword")]
        public string NewPassword { get; set; }

        [DataMember(Name = "confirmPassword")]
        public string ConfirmPassword { get; set; }

        [DataMember(Name = "oldPassword")]
        public string OldPassword { get; set; }
    }
}