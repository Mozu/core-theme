using System.Net;
using AutoMapper;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Security;

namespace Mozu.SiteBuilder.UX.Admin.Helpers
{
    public class CurrentUserHelper : ICurrentUserHelper
    {
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly IAdminUserWebApiClient _adminUserWebApiClient;

        public CurrentUserHelper(IAuthenticationHelper authenticationHelper, IAdminUserWebApiClient adminUserWebApiClient)
        {
            _authenticationHelper = authenticationHelper;
            _adminUserWebApiClient = adminUserWebApiClient;
        }

        public Api.Models.Account.User GetCurrentUser()
        {
            var token = _authenticationHelper.GetCurrentProfileToken();

            if (token != null && !string.IsNullOrEmpty(token.UserId))
            {
                var res = _adminUserWebApiClient.GetUser(token.UserId, null).Result;
                if (!res.HasException && res.ResponseMessage != null && res.ResponseMessage.StatusCode != HttpStatusCode.NotFound)
                {
                    return Mapper.Map<Api.Models.Account.User>(res.ReadAsAsync().Result);
                }
            }
            return new Api.Models.Account.User { IsAuthenticated = false };
        }
    }
}