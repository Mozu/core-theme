namespace Mozu.SiteBuilder.UX.Admin.Helpers
{
    public interface IPasswordHelper
    {
        void UpdateForgottenPassword(Api.Models.Account.LoginUser user);

        void CreatePasswordResetRequest(string email);
    }
}