using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    [DataContract]
    public class Invitation
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "siteId")]
        public int SiteId { get; set; }

        [DataMember(Name = "tenantId")]
        public int TenantId { get; set; }

        [DataMember(Name = "roleId")]
        public int RoleId { get; set; }

        [DataMember(Name = "role")]
        public string Role { get; set; }

        [DataMember(Name = "email")]
        public string EmailAddress { get; set; }

        [DataMember(Name = "firstName")]
        public string FirstName { get; set; }

        [DataMember(Name = "lastName")]
        public string LastName { get; set; }

        [DataMember(Name = "dateLastSent")]
        public DateTime DateLastSent { get; set; }

        [DataMember(Name = "state")]
        public string State { get; set; }
    }
}