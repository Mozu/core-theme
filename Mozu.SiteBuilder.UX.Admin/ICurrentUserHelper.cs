namespace Mozu.SiteBuilder.UX.Admin
{
    public interface ICurrentUserHelper
    {
        Api.Models.Account.User GetCurrentUser();
    }
}