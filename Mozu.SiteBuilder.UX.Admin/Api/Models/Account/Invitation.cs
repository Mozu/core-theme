using System;
using System.Collections.Generic;
using FSharpx.Collections;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{

    public class Invitation
    {
        public string Id { get; set; }

        public int SiteId { get; set; }

        public int TenantId { get; set; }

        //[JsonProperty(PropertyName = "roleIds")]
        //public List<int> RoleIds { get; set; }

        //public string Role { get; set; }

        //public List<InvitationRole> InvitationRoles { get; set; }

        [JsonProperty(PropertyName = "invitationRoles")]
        public List<AccountUserRole> Roles { get; set; }

        [JsonProperty(PropertyName = "email")]
        public string EmailAddress { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime DateLastSent { get; set; }

        public string State { get; set; }
    }

    public class InvitationRole
    {
        [JsonProperty(PropertyName = "id")]
        public int RoleId { get; set; }

        [JsonProperty(PropertyName = "name")]
        public string Name { get; set; }
    }
}
