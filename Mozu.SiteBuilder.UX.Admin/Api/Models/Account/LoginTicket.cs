using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    [DataContract]
    public class LoginTicket
    {
        [DataMember(Name = "accessToken")]
        public string AccessToken { get; set; }
        
        [DataMember(Name = "tenantId")]
        public int TenantId { get; set; }

        [DataMember(Name="redirectUrl", IsRequired=false, EmitDefaultValue=false)]
        public string RedirectUrl { get; set; }
    }
}
