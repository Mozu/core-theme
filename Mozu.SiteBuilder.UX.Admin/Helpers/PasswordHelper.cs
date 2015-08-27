using Mozu.AdminUser.Contracts;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core.Api.Client;

namespace Mozu.SiteBuilder.UX.Admin.Helpers
{
    public class PasswordHelper : IPasswordHelper
    {
        private readonly IMultiScopeAdminUserWebApiClient _adminUserWebApiClient;

        public PasswordHelper(IMultiScopeAdminUserWebApiClient adminUserWebApiClient)
        {
            _adminUserWebApiClient = adminUserWebApiClient.CloneWithoutUserClaims();
        }

        public void UpdateForgottenPassword(Api.Models.Account.LoginUser user)
        {
            //var rootUserRepo = new AdminUserWebApiClient(new ServiceClientMessageHandler2(new ApiContext() { SiteId = VOLUSIONSITEID, TenantId = VOLUSIONTENANTID }));
            var res = _adminUserWebApiClient.UpdateForgottenPassword(new ConfirmationInfo()
                {
                    EmailAddress = user.EmailAddress,
                    ConfirmationCode = user.ConfirmationCode,
                    NewPassword = user.Password
                }).Result;

            if (res.HasException)
            {
                throw res.ReadException();
            }
        }

        public void CreatePasswordResetRequest(string email)
        {
            //var rootUserRepo = new AdminUserWebApiClient(new ServiceClientMessageHandler2(new ApiContext() { SiteId = VOLUSIONSITEID, TenantId = VOLUSIONTENANTID }));
            var res = _adminUserWebApiClient.ResetPassword(new ResetPasswordInfo() { EmailAddress = email }).Result;
            if (res.HasException)
            {
                throw res.ReadException();
            }
        }
    }
}