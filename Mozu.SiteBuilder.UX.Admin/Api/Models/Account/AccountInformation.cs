

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    
    public class AccountInformation
    {

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Email { get; set; }

        public string OldPassword { get; set; }

        public string NewPassword { get; set; }

        public string ConfirmPassword { get; set; }
    }
}