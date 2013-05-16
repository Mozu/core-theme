using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.AdminUser.Contracts;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Models.Admin;
using LoginUser = Mozu.SiteBuilder.UX.Admin.Api.Models.Account.LoginUser;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public class VolusionLoginHelper : IVolusionLoginHelper
    {
        private IInvitationWebApiClient _invitationWebApiClient;
        private readonly IUserHelper _userHelper;
        private readonly IAdminUserWebApiClient _usersRepo;
        private readonly IAuthenticationHelper _authHelper;
        private readonly ISettings _settings;

        public VolusionLoginHelper(IInvitationWebApiClient invitationWebApiClient, IUserHelper userHelper, IAdminUserWebApiClient usersRepo, IAuthenticationHelper authHelper, ISettings settings)
        {
            _invitationWebApiClient = invitationWebApiClient;
            _userHelper = userHelper;
            _usersRepo = usersRepo;
            _authHelper = authHelper;
            _settings = settings;
        }

        public  List< Mozu.Tenant.Contracts.Tenant> VolusionLogIn(LoginUser user)
        {
            UserLoginResult ulr = null;
            //Core.Api.Contracts.UserAuthTicket ticket = null;
            var dcUser = Mapper.Map<Core.Api.Contracts.User>(user);
            if (!string.IsNullOrEmpty(user.Invitation))
            {
                var invite = _invitationWebApiClient.GetInvitation(user.Invitation).Result.ReadAsSync();

                if (_userHelper.UserExists(user))
                {
                    ulr = _usersRepo.Login(new Core.Api.Contracts.UserAuthInfo {EmailAddress = user.EmailAddress, Password = user.Password}).Result.ReadAsSync();

                    _authHelper.SetCurrentUser(ulr.AuthTicket);
                    var user1 = _authHelper.GetCurrentUser();
                    _invitationWebApiClient = new InvitationWebApiClient(new ServiceClientMessageHandler(new ApiContext() { SiteId = user.SiteId.GetValueOrDefault(0), TenantId = user.TenantId.GetValueOrDefault(0), UserClaims = user1 }, _settings));

                    var ci = _invitationWebApiClient.ConfirmInvitation(user.Invitation).Result;
                    if (ci.HasException)
                    {
                        throw ci.ReadException();
                    }
                }
                else
                {

                    dcUser.EmailAddress = invite.EmailAddress;
                    dcUser.LocaleCode = string.IsNullOrEmpty(dcUser.LocaleCode) ? "en-US" : dcUser.LocaleCode;

                    var ticket = _invitationWebApiClient.CompleteInvitation(user.Invitation, dcUser).Result.ReadAsSync();
                    _authHelper.SetCurrentUser(ticket);
                }



            }
            if (ulr == null)
            {
                ulr = _usersRepo.Login(new Core.Api.Contracts.UserAuthInfo { EmailAddress = user.EmailAddress, Password = user.Password }).Result.ReadAsSync ();
                // var ulr2 = _usersRepo.LoginByScope(new Core.Api.Contracts.UserAuthInfo { EmailAddress = user.EmailAddress, Password = user.Password }, UserScopeType.SystemAdmin.ToString()).Result.ReadAsSync();
            }
            _authHelper.SetCurrentUser(ulr.AuthTicket);
           




           // var contexts = Mapper.Map<List<TaContext>>(ulr.Tenants);

            return ulr.Tenants;

          
        }
    }
}