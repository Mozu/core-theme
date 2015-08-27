using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    
    public class PasswordInfo
    {
        public string NewPassword { get; set; }

        public string ConfirmPassword { get; set; }

        public string OldPassword { get; set; }
    }
}
