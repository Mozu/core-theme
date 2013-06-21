using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.AdminUser.Contracts;
using Mozu.AdminUser.Contracts.Clients;
using System.Linq;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Models.Admin;
using Mozu.User.Contracts;
using LoginUser = Mozu.SiteBuilder.UX.Admin.Api.Models.Account.LoginUser;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public class VolusionLoginHelper : IVolusionLoginHelper
    {

        private IMultiScopeInvitationWebApiClient _invitationWebApiClient;
        private readonly IUserHelper _userHelper;
        private readonly IPublicAdminAuthTicketWebApiClient _usersRepo;
        private readonly IAuthenticationHelper _authHelper;
        private readonly ISettings _settings;

        public VolusionLoginHelper(IMultiScopeInvitationWebApiClient invitationWebApiClient, IUserHelper userHelper, IPublicAdminAuthTicketWebApiClient usersRepo, IAuthenticationHelper authHelper, ISettings settings)
        {
            _invitationWebApiClient = invitationWebApiClient;
            _userHelper = userHelper;
            _usersRepo = usersRepo;
            _authHelper = authHelper;
            _settings = settings;

        }

        public  List< Mozu.Tenant.Contracts.Tenant> VolusionLogIn(LoginUser user)
        {
           
            
            TenantAdminUserAuthTicket ulr = null;
          //  UserLoginResult ulr = null;
            //Core.Api.Contracts.UserAuthTicket ticket = null;
            var dcUser = Mapper.Map<Core.Api.Contracts.User>(user);
            if (!string.IsNullOrEmpty(user.Invitation))
            {
                var invite = _invitationWebApiClient.GetInvitation(user.Invitation).Result.ReadAsSync();

                if (_userHelper.UserExists(user))
                {

                    ulr= _usersRepo.CreateUserAuthTicket(new Core.Api.Contracts.UserAuthInfo {EmailAddress = user.EmailAddress, Password = user.Password}).Result.ReadAsSync();

                    _authHelper.SetCurrentUser(ulr.AccessToken);
                    var user1 = _authHelper.GetCurrentUser();

                   // _invitationWebApiClient = new InvitationWebApiClient(new ServiceClientMessageHandler(new ApiContext() { SiteId = user.SiteId.GetValueOrDefault(0), TenantId = user.TenantId.GetValueOrDefault(0), UserClaims = user1 }, _settings));
                 
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
                    var ticket = _invitationWebApiClient.With( x=> x.UserClaims = null ).CompleteInvitation(user.Invitation, dcUser).Result.ReadAsSync();
                    _authHelper.SetCurrentUser(ticket);
                }



            }
            if (ulr == null)
            {
                ulr = _usersRepo.CreateUserAuthTicket(new Core.Api.Contracts.UserAuthInfo { EmailAddress = user.EmailAddress, Password = user.Password }).Result.ReadAsSync();

                // var ulr2 = _usersRepo.LoginByScope(new Core.Api.Contracts.UserAuthInfo { EmailAddress = user.EmailAddress, Password = user.Password }, UserScopeType.SystemAdmin.ToString()).Result.ReadAsSync();
            }
            _authHelper.SetCurrentUser( new UserAuthTicket()
                                            {
                                                AccessToken = ulr.AccessToken ,
                                                AccessTokenExpiration = ulr.AccessTokenExpiration ,
                                                GrantedBehaviors = ulr.GrantedBehaviors ,
                                                RefreshToken = ulr.RefreshToken,
                                                User = ulr.User ,
                                                RefreshTokenExpiration = ulr.RefreshTokenExpiration 
                                            });
           




           // var contexts = Mapper.Map<List<TaContext>>(ulr.Tenants);
            if (ulr.AvailableTenants == null || ulr.AvailableTenants.Count == 0)
            {
                if (ulr.Tenant != null)
                {
                    return new List<Tenant.Contracts.Tenant> { ulr.Tenant };    
                }
                return new List<Tenant.Contracts.Tenant>();
            }
            return ulr.AvailableTenants.ToList();


        }
    }
}