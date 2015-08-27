using System;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    
    public class LoginTicket
    {
        public string AccessToken { get; set; }

        public string RefreshToken { get; set; }
   
        public int TenantId { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string RedirectUrl { get; set; }
    }
}
