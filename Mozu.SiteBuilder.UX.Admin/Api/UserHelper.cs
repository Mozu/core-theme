using AutoMapper;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core.Api.Client;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public class UserHelper : IUserHelper
    {
        private readonly Mozu.AdminUser.Contracts.Clients.IMultiScopeAdminUserWebApiClient _adminUserWebApiClient;

        public UserHelper(IMultiScopeAdminUserWebApiClient adminUserWebApiClient)
        {
            _adminUserWebApiClient = adminUserWebApiClient.CloneWithoutUserClaims();
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

           
            var res = _adminUserWebApiClient.GetUserByEmail(user.EmailAddress, null).Result;
            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                var du = res.ReadAsSync();
                return du != null && du.EmailAddress != null;
            }
            return false;
        }

        public Core.Api.Contracts.User UpdateUser(AccountInformation accountInformation, string userId)
        {
            var contractsUser = _adminUserWebApiClient.GetUser(userId, null).Result.ReadAsAsync().Result;
            contractsUser.FirstName = accountInformation.FirstName;
            contractsUser.LastName = accountInformation.LastName;
            contractsUser.EmailAddress = accountInformation.Email;

            return _adminUserWebApiClient.UpdateUser(contractsUser, userId).Result.ReadAsSync();
        }

    }
}