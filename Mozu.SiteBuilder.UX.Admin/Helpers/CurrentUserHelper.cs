using System.Net;
using AutoMapper;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.Tenant.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Admin.Helpers
{
    public class CurrentUserHelper : ICurrentUserHelper
    {
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly IMultiScopeAdminUserWebApiClient _adminUserWebApiClient;
        private readonly ISiteBuilderApiContext _context;

        public CurrentUserHelper(IAuthenticationHelper authenticationHelper, IMultiScopeAdminUserWebApiClient adminUserWebApiClient, ISiteBuilderApiContext context)
        {
            _authenticationHelper = authenticationHelper;
            _adminUserWebApiClient = adminUserWebApiClient;
            _context = context;
        }

        public Api.Models.Account.User GetCurrentUser()
        {

            var ticket = _authenticationHelper.GetAuthTicket();
            if (ticket != null)
            {
                if (ticket.User != null)
                {
                    return new Api.Models.Account.User()
                               {
                                   FirstName = ticket.User.FirstName,
                                   LastName = ticket.User.LastName,
                                   EmailAddress = ticket.User.EmailAddress,
                                   Id = ticket.User.UserId,
                                   BehaviorIds = _context.UserClaims.BehaviorIds
                               };
                }
            }
            if ( _context.UserClaims != null && ! _context.UserClaims.IsAnonymous )
            {


                var res = _adminUserWebApiClient.GetUser(_context.UserClaims.UserId , null).Result;
                if (!res.HasException && res.ResponseMessage != null && res.ResponseMessage.StatusCode != HttpStatusCode.NotFound)
                {
                    return Mapper.Map<Api.Models.Account.User>(res.ReadAsAsync().Result);
                }
            }
            return new Api.Models.Account.User { IsAuthenticated = false };
        }
    }
}