namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public interface IUserHelper
    {
        Models.Account.User GetUser(string id);

        bool UserExists(Models.Account.LoginUser user);
    }
}