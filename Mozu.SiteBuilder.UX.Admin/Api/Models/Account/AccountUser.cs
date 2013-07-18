using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    [DataContract]
    public class AccountUserRoleUpdate
    {
        [DataMember(Name = "userId")]
        public string UserId { get; set; }

        [DataMember(Name = "roles")]
        public int[] Roles { get; set; }

     
    }

    [DataContract]
    public class AccountUser
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }


        [DataMember(Name = "roles")]
        public List<AccountUserRole> Roles { get; set; }


        [DataMember(Name = "email")]
        public string Email { get; set; }

        [DataMember(Name = "activity")]
        public string Activity { get; set; }

        [DataMember(Name = "type")]
        public string Type { get; set; }
    }

    [DataContract]
    public class AccountUserRole
    {
        [DataMember(Name = "id")]
        public int RoleId { get; set; }

        [DataMember(Name = "name")]
        public string RoleName { get; set; }
    }
}