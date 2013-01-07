using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    [DataContract]
    public class AccountUserRoleUpdate
    {
        [DataMember(Name = "userId")]
        public string UserId { get; set; }

        [DataMember(Name = "oldRole")]
        public int OldRole { get; set; }

        [DataMember(Name = "newRole")]
        public int NewRole { get; set; }
    }

    [DataContract]
    public class AccountUser
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "roleId")]
        public int RoleId { get; set; }

        [DataMember(Name = "role")]
        public string Role { get; set; }

        [DataMember(Name = "email")]
        public string Email { get; set; }

        [DataMember(Name = "activity")]
        public string Activity { get; set; }

        [DataMember(Name = "type")]
        public string Type { get; set; }
    }
}