using System.Collections.Generic;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    
    public class AccountUserRoleUpdate
    {
        public string UserId { get; set; }

        //public List<AccountUserRole> Roles { get; set; }
        public List<int> Roles { get; set; }
     
    }

    
    public class AccountUser
    {
        public string Id { get; set; }


        public List<AccountUserRole> Roles { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Email { get; set; }

        public System.DateTime DateLastSent { get; set; }

        public string Activity { get; set; }

        public string Type { get; set; }
    }

    
    public class AccountUserRole
    {
        [JsonProperty(PropertyName = "id")]
        public int RoleId { get; set; }

        [JsonProperty(PropertyName = "roleName")]
        public string RoleName { get; set; }
    }
}
