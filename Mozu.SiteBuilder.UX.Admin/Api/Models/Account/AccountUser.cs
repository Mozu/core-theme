using System.Collections.Generic;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    
    public class AccountUserRoleUpdate
    {
        public string UserId { get; set; }

        public int[] Roles { get; set; }

     
    }

    
    public class AccountUser
    {
        public string Id { get; set; }


        public List<AccountUserRole> Roles { get; set; }

        public string Email { get; set; }

        public string Activity { get; set; }

        public string Type { get; set; }
    }

    
    public class AccountUserRole
    {
        [JsonProperty(PropertyName = "id")]
        public int RoleId { get; set; }

        [JsonProperty(PropertyName = "name")]
        public string RoleName { get; set; }
    }
}
