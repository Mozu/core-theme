using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    [DataContract]
    public class AccountInformation
    {
        [DataMember(Name = "firstName")]
        public string FirstName { get; set; }

        [DataMember(Name = "lastName")]
        public string LastName { get; set; }

        [DataMember(Name = "email")]
        public string Email { get; set; }

        [DataMember(Name = "oldPassword")]
        public string OldPassword { get; set; }

        [DataMember(Name = "newPassword")]
        public string NewPassword { get; set; }

        [DataMember(Name = "confirmPassword")]
        public string ConfirmPassword { get; set; }
    }
}