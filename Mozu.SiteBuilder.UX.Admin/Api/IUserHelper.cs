using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public interface IUserHelper
    {
        Models.Account.User GetUser(string id);

        bool UserExists(LoginUser user);

        Core.Api.Contracts.User UpdateUser(AccountInformation accountInformation, string userId);
    }
}