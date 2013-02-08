using AutoMapper;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public class UserHelper : IUserHelper
    {
        private readonly IAdminUserWebApiClient _adminUserWebApiClient;

        public UserHelper(IAdminUserWebApiClient adminUserWebApiClient)
        {
            _adminUserWebApiClient = adminUserWebApiClient;
        }

        public Models.Account.User GetUser(string id)
        {
            var res = _adminUserWebApiClient.GetUser(id, null).Result;
            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                return Mapper.Map<Models.Account.User>(res.ReadAsAsync().Result);
            }
            return null;
        }

        public bool UserExists(LoginUser user)
        {
            if (string.IsNullOrEmpty(user.EmailAddress))
            {
                return false;
            }

            // var rootUserRepo = new AdminUserWebApiClient(new ServiceClientMessageHandler2(new ApiContext() { SiteId = VOLUSIONSITEID, TenantId = VOLUSIONTENANTID }));
            var res = _adminUserWebApiClient.GetUserByEmail(user.EmailAddress, null).Result;
            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                var du = res.ReadAsSync();
                return du != null && du.EmailAddress != null;
            }
            return false;
        }
    }
}