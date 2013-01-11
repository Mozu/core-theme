using System;
using System.Linq;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.ServiceModel;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Controllers;
using AutoMapper;
using Mozu.AdminUser.Contracts;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core.Api;
using Mozu.Core.Api.Client;
using Mozu.Core;
using Mozu.Core.Api.Contracts.Client;
using Mozu.PaymentService.Contracts.Clients.Public;
using Mozu.Provisioning.Contracts;
using Mozu.SiteBuilder.UX.Models.Users;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;
using System.ServiceModel.Web;

using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
//using DC = Mozu.Core.Api.Contracts;
using PasswordInfo = Mozu.SiteBuilder.UX.Admin.Api.Models.Account.PasswordInfo;
using AdminUser2 = Mozu.SiteBuilder.UX.Admin.Api.Models.Account.User;
using Invitation = Mozu.SiteBuilder.UX.Admin.Api.Models.Account.Invitation;
using System.Text;
using IInvitationWebApiClient = Mozu.AdminUser.Contracts.Clients.IInvitationWebApiClient;
using IRoleWebApiClient = Mozu.AdminUser.Contracts.Clients.IRoleWebApiClient;
using InvitationWebApiClient = Mozu.AdminUser.Contracts.Clients.InvitationWebApiClient;
using ApiRole = Mozu.Core.Api.Contracts.Role;
using AuthTicketWebApiClient = Mozu.AdminUser.Contracts.Clients.AuthTicketWebApiClient;
using IAuthTicketWebApiClient = Mozu.AdminUser.Contracts.Clients.IAuthTicketWebApiClient;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    [AllowAnonymous]
    public class AccountController : BaseController, IHttpController
    {
        private readonly IAdminUserWebApiClient _usersRepo;
        
        private IRoleWebApiClient _rolesRepo;
        private Mozu.Provisioning.Contracts.Clients.IMerchantSignUpWebApiClient   _merchantSignUpWebApiClient;
        private readonly IAuthTicketWebApiClient _authTicketRepo;
        private ITenantsWebApiClient _tenantClient;
        private readonly IAuthenticationHelper _authHelper;
        private readonly IUniversalSiteApiClient _siteClient;
        private  IInvitationWebApiClient _invitationWebApiClient;
        private List<ApiRole> roles;
        private readonly  IAdminUserWebApiClient _adminUserWebApiClient;
        private ISiteBuilderContext _siteBuilderContext;

        public AccountController(IAdminUserWebApiClient user, IRoleWebApiClient role, IAuthTicketWebApiClient auth, ITenantsWebApiClient tenantsClient, IAuthenticationHelper authHelper, IUniversalSiteApiClient siteClient, IInvitationWebApiClient invitationWebApiClient, Mozu.Provisioning.Contracts.Clients.IMerchantSignUpWebApiClient merchantSignUpWebApiClient, IAdminUserWebApiClient adminUserWebApiClient, ISiteBuilderContext siteBuilderContext)
        {
            _usersRepo = user;
            _rolesRepo = role;
            _authTicketRepo = auth;
            _tenantClient = tenantsClient;
            _authHelper = authHelper;
            _siteClient = siteClient;


            _merchantSignUpWebApiClient = merchantSignUpWebApiClient;
            _adminUserWebApiClient = adminUserWebApiClient;
            _invitationWebApiClient = invitationWebApiClient;
            _siteBuilderContext = siteBuilderContext;
        }

        
        [WebInvoke(UriTemplate = "/logoff")]
        public Task<Response<List<AdminUser2>>> Logoff()
        {
            _authHelper.LogOut();
            return List(new List<AdminUser2>());
        }
        
        [WebGet(UriTemplate = "/list")]
        public Task<Response<List<AdminUser2>>> GetUsers(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            List<Task<Mozu.Core.Api.Contracts.Client.ServiceClientResponse<Core.Api.Contracts.User>>> tasks= new System.Collections.Generic.List<Task<Mozu.Core.Api.Contracts.Client.ServiceClientResponse<Core.Api.Contracts.User>>>();
            if (pagingParams.id != null)
            {
                tasks.Add(_usersRepo.GetUser((string)pagingParams.id, null));
                 
            }
            StringBuilder sb = new StringBuilder();
            HashSet<string> hs = new HashSet<string>();
            foreach (var filter in extFilter)
            {
                if (hs.Contains((string)filter.value))
                {
                    continue;
                }
                hs.Add((string)filter.value);
                if (sb.Length > 0)
                {
                    sb.Append(" or ");
                }

                switch (filter.property.ToLowerInvariant())
                {
                    case "emailaddress":
                    case "email":
                        {
                            
                        sb.AppendFormat("EmailAddress dq {0}", filter.value, filter.comparison);
                            tasks.Add(_usersRepo.GetUserByEmail ((string)filter.value, null));
                        break;
                        }
                    
                    case "id":
                        {
                        sb.AppendFormat("id dq {0}", filter.value, filter.comparison);
                        tasks.Add(_usersRepo.GetUser ((string)filter.value, null));
                        break;
                        }
                    
                }
            }
            Task.WaitAll(tasks.ToArray());
            List<AdminUser2> users = new List<AdminUser2>();
            foreach (var task in tasks)
            {
                if (task.Result.ResponseMessage.IsSuccessStatusCode)
                {
                    users.Add(Mapper.Map<AdminUser2>(task.Result.ReadAsSync()));
                }
            }
            return this.List<AdminUser2>(users);
            
        
        }


        public Task<Response<List<AdminUser2>>> GetAccount()
        {
            LightweightUserClaims lwU = _authHelper.GetCurrentUser();
            var ctx = Mvc.SiteBuilderContext.Current;
            var u = _usersRepo.GetUser(lwU.UserId, null).Result.ReadAsAsync().Result;

            return List(Mapper.Map<AdminUser2>(u));
        }

        [WebGet(UriTemplate = "/roles/list")]
        public Task<Response<List<Role>>> GetRoles()
        {
            var list = Roles.Select(Mapper.Map<Role>).ToList();
            return List(list);
        }

        private List<ApiRole> Roles
        {
            get
            {
                if (roles != null)
                    return roles;

                var task = _rolesRepo.GetRoles();
                var response = task.Result;
                return roles = response.ReadAsAsync().Result.Items;
            }
        }

        public List<ApiRole> GetUserSitesRoles(string userId)
        {
            var res = _usersRepo.GetUserRoles(userId, null).Result;

           // var rootUserRepo = new AdminUserWebApiClient(new ServiceClientMessageHandler2(new ApiContext() { SiteId = VOLUSIONSITEID, TenantId = VOLUSIONTENANTID }));
           // var res = rootUserRepo.GetUser(userId, null).Result;
            if ( res.ResponseMessage.IsSuccessStatusCode )
            {
                return res.ReadAsSync().Items;
            }

            return new List<Core.Api.Contracts.Role>();

        }


        public AdminUser2 GetCurrentUser()
        {
            var token = _authHelper.GetCurrentProfileToken();
            
            if (token != null && !string.IsNullOrEmpty(token.UserId))
            {
                var res = _usersRepo.GetUser(token.UserId, null).Result;
                if (!res.HasException && res.ResponseMessage != null && res.ResponseMessage.StatusCode != HttpStatusCode.NotFound)
                {
                    return Mapper.Map<AdminUser2>(res.ReadAsAsync().Result);
                }

            }
            return new AdminUser2() { IsAuthenticated = false };

        }


        public AdminUser2 GetUser(string id)
        {
            var res = _usersRepo.GetUser(id, null).Result;
            if ( res.ResponseMessage.IsSuccessStatusCode )
            {
                return Mapper.Map<AdminUser2>(res.ReadAsAsync().Result);
             
            }
            return null;
        }

        public Task<Response<List<Tuple<Site, int>>>> Register(LoginUser user)
        {
            //var rootAuthRepo = new AuthTicketWebApiClient(new ServiceClientMessageHandler2(new ApiContext() { SiteId = VOLUSIONSITEID, TenantId = VOLUSIONTENANTID }));
            //var rootUserRepo = new AdminUserWebApiClient(new ServiceClientMessageHandler2(new ApiContext() { SiteId = VOLUSIONSITEID, TenantId = VOLUSIONTENANTID }));


            var res = _merchantSignUpWebApiClient.MerchantSignUp(new MerchantSignUpRequest()
                                                                     {
                                                                         EmailAddress = user.EmailAddress,
                                                                         Password = user.Password,
                                                                         Domain = user.SiteName + "." + System.Configuration.ConfigurationManager.AppSettings["dnszone"]

                                                                     }).Result.ReadAsSync();


            return VolusionLogIn(user);
        }

        public bool RemoveRoleFromSite(int siteId, int roleId)
        {
            LightweightUserClaims user = _authHelper.GetCurrentUser();
            var site = _siteClient.GetSite(siteId).Result.ReadAsSync();

            //var userThing = new UserWebApiClient(new ServiceClientMessageHandler2(new ApiContext() { SiteId = site.Id, TenantId = site.TenantId }));
            //userThing.DeleteUserRoleForTenant(user.UserId, roleId);

            // NOTE: This replaces the above code, I think, I need to double check and test though... - CM
            var userClaims = new LightweightUserClaims { UserId = user.UserId };
            var roleThing = new RoleWebApiClient(new ServiceClientMessageHandler2(new ApiContext() { SiteId = site.Id, TenantId = site.TenantId, UserClaims = userClaims }));
            roleThing.DeleteRole(roleId);

            return true;
        }

        public Site ChangeSite(int siteId)
        {

            var site = _siteClient.GetSite(siteId).Result.ReadAsSync();
            var repo = new AuthTicketWebApiClient(new ServiceClientMessageHandler2(new ApiContext() { SiteId = siteId, TenantId = site.TenantId }));
            var ticket = _authHelper.GetCurrentTicket();
            ticket = repo.RefreshUserAuthTicket(ticket.RefreshToken).Result.ReadAsSync();
            var siteTicket = repo.CreateAuthTicketForSite(new Core.Api.Contracts.UserTokenInfo { AccessToken = ticket.AccessToken }).Result.ReadAsSync();
            _authHelper.SetCurrentUser(siteTicket);
            var lwU = Mozu.Core.LightweightUserClaims.Parse(siteTicket.AccessToken);
            Mvc.SiteBuilderContext.Current.SiteId = lwU.SiteId;
            Mvc.SiteBuilderContext.Current.TenantId = site.TenantId;
            Mvc.SiteBuilderContext.Current.Save();
            return site;
        }










        public Task<Response<List<Tuple<Site, int>>>> VolusionLogIn(LoginUser user)
        {
            try
            {
                UserLoginResult ulr = null;
                //Core.Api.Contracts.UserAuthTicket ticket = null;
                LightweightUserClaims volLwp = null;
                var dcUser = Mapper.Map<Core.Api.Contracts.User>(user);
                if (!string.IsNullOrEmpty(user.Invitation))
                {
                    var invite = _invitationWebApiClient.GetInvitation(user.Invitation).Result.ReadAsSync();

                    if (UserExists(user))
                    {
                       // var rootAuthRepo = new AuthTicketWebApiClient(new ServiceClientMessageHandler2(new ApiContext() { SiteId = VOLUSIONSITEID, TenantId = VOLUSIONTENANTID }));
                        ulr = _usersRepo.Login(new Core.Api.Contracts.UserAuthInfo { EmailAddress = user.EmailAddress, Password = user.Password }).Result.ReadAsSync();
                      //  ticket = lur.AuthTicket;
                        //ticket = _usersRepo.CreateUserAuthTicket().Result.ReadAsSync();
                        _authHelper.SetCurrentUser(ulr.AuthTicket );
                        var user1=_authHelper.GetCurrentUser();
                        _invitationWebApiClient = new InvitationWebApiClient(new ServiceClientMessageHandler2(new ApiContext() { SiteId = user.SiteId.GetValueOrDefault(0), TenantId = user.TenantId.GetValueOrDefault(0), UserClaims = user1 }));
                                                     
                        
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

                       var  ticket = _invitationWebApiClient.CompleteInvitation(user.Invitation, dcUser).Result.ReadAsSync();
                       _authHelper.SetCurrentUser(ticket);
                    }



                }
                if (ulr == null)
                {
                    ulr = _usersRepo.Login(new Core.Api.Contracts.UserAuthInfo { EmailAddress = user.EmailAddress, Password = user.Password }).Result.ReadAsSync();
                  
                }
                _authHelper.SetCurrentUser(ulr.AuthTicket );
                volLwp = LightweightUserClaims.Parse(ulr.AuthTicket.AccessToken );



             //   var res = SiteRolesList(volLwp.UserId );
               // return this.List<Tuple<Site, int>>(res);
                  //      sites.Items.FirstOrDefault(site=> site.Id == role.SiteId )
                List<Site> sites = new List<Site>();
                List<Task<ServiceClientResponse<SiteCollection>>> blurgs = new List<Task<ServiceClientResponse<SiteCollection>>>();
                foreach (var tenant in ulr.Tenants)
                {
                    blurgs.Add(_tenantClient.GetSites(tenant.Id));
                }
                Task.WaitAll(blurgs.ToArray() );

                foreach (var blurg in blurgs)
                {
                    sites.AddRange(blurg.Result.ReadAsSync().Items);
                }

                //var sites = _siteClient.GetSites(0, int.MaxValue, null, string.Join(" or ", ulr.Tenants.Select(x => "TenantId eq " + x))).Result.ReadAsSync();
                return this.List<Tuple<Site, int>>(sites.Select(x => new Tuple<Site, int>(x, 1)).ToList());
            }
            catch (Exception e)
            {
                return FailureList<Tuple<Site, int>>(e.UnwrapAgg().Message);
            }

        }
        //public List<Tuple<Site, int>> SiteRolesList(string userId)
        //{
        //    var userRepo = new UserWebApiClient(new VolusionApiWebClientFactory(new VolusionWebApiContext() { SiteId = VOLUSIONSITEID, TenantId = VOLUSIONTENANTID }));
        //    var rolesTask = userRepo.GetUserRoles(userId, null).Result;
        //    var roles = rolesTask.ResponseMessage.IsSuccessStatusCode ? rolesTask.ReadAsSync() : new RoleInSiteCollection() { Items = new List<RoleInSite>() };

        //    var siteIds = roles.Items.Select(x => (int?)x.SiteId);

        //    var sites = _siteClient.GetSites(0, int.MaxValue, null, string.Join(" or ", siteIds.Select(x => "id eq " + x))).Result.ReadAsSync();

        //    var res = roles.Items.Select(role =>
        //                new Tuple<Site, int>(sites.Items.FirstOrDefault(site => site.Id == role.SiteId), role.RoleId))
        //        .Where(x => x.Item1 != null).OrderByDescending(x => x.Item1.TenantId).ToList();
        //    return res;
        //}
        public List<Tuple<Site, int>> SiteRolesList(string userId)
        {

            var rolesTask = _usersRepo.GetUserRoles(userId, null).Result;

            var roles = rolesTask.ResponseMessage.IsSuccessStatusCode ? rolesTask.ReadAsSync() : new Core.Api.Contracts.RoleCollection() { Items = new List<Core.Api.Contracts.Role>() };

            var siteIds = roles.Items.Select(x => (int?)x.TenantId);

            var sites = _siteClient.GetSites(0, int.MaxValue, null, string.Join(" or ", siteIds.Select(x => "id eq " + x))).Result.ReadAsSync();

            var res = roles.Items.Select(role =>
                        new Tuple<Site, int>(sites.Items.FirstOrDefault(site => site.Id == role.TenantId), role.Id))
                .Where(x => x.Item1 != null).OrderByDescending(x => x.Item1.TenantId).ToList();
            return res;
        }


       

        [WebInvoke(Method = "POST", UriTemplate = "/users/delete")]
        public Task<Response<AccountUser>> DeleteUser(AccountUser accountUser)
        {
            _adminUserWebApiClient.RemoveUserRole(accountUser.Id, accountUser.RoleId).Result.ReadAsAsync();

            return Single(new AccountUser());
        }

        [WebInvoke(Method = "POST", UriTemplate = "/invitations/delete")]
        public Task<Response<Invitation>> DeleteInvitation(Invitation invitation)
        {
            _invitationWebApiClient.DeclineInvitation(invitation.Id).Result.ReadAsAsync();

            return Single(invitation);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/invitations/create")]
        public Task<Response<Invitation>> CreateInvitation(Invitation invitation)
        {
            try
            {
                var result = _invitationWebApiClient.CreateInvitation(invitation.RoleId, invitation.EmailAddress).Result.ReadAsSync();
                var newInvitation = Mapper.Map<AdminUser.Contracts.Invitation, Invitation>(result);

                return Single(newInvitation);
            }
            catch (Exception e)
            {
                return Message<Invitation>(false, e.Message);
            }
        }

        [WebGet(UriTemplate = "/users/list")]
        public Task<Response<List<AccountUser>>> GetAccountUsers()
        {
            var admins = _adminUserWebApiClient.Get(null, null, null).Result.ReadAsAsync().Result.Items;
            var invites = _invitationWebApiClient.GetInvitations(null).Result.ReadAsAsync().Result.Items;
            var invitations = Mapper.Map<List<Mozu.AdminUser.Contracts.Invitation>, List<Invitation>>(invites);
            foreach (var invitation in invitations)
            {
                var role = Roles.FirstOrDefault(r => r.Id == invitation.RoleId);
                invitation.Role = role == null ? "(unknown)" : role.Name;
            }

            var users = admins.Select(Mapper.Map<AccountUser>).Concat(
                invitations.Select(Mapper.Map<AccountUser>)).ToList();

            return List(users);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/invitations/resend")]
        public Task<Response<Invitation>> ResendInvitation(Invitation invitation)
        {
            _invitationWebApiClient.ResubmitInvitation(invitation.Id).Result.ReadAsAsync();

            return Single(invitation);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/users/updaterole")]
        public Task<Response<AccountUserRoleUpdate>> UpdateAccountUser(AccountUserRoleUpdate info)
        {
            try
            {
                var remove = _adminUserWebApiClient.RemoveUserRole(info.UserId, info.OldRole);
                var add = _adminUserWebApiClient.AddUserRole(info.UserId, info.NewRole);
                Task.WaitAll(remove, add);
            }
            catch (Exception e)
            {
                return Message<AccountUserRoleUpdate>(false, e.Message);
            }

            return Single(info);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/password/update")]
        public Task<Response<AdminUser2>> ChangePassword(PasswordInfo passwordInfo)
        {
            try
            {
                var newPasswordInfo = Mapper.Map<AdminUser.Contracts.PasswordInfo>(passwordInfo);
                var user = _authHelper.GetCurrentUser();

                _usersRepo.ChangePassword(newPasswordInfo, user.UserId).Result.ReadAsSync();

                var result = _usersRepo.GetUser(user.UserId, null).Result.ReadAsSync();
                var updatedUser = Mapper.Map<AdminUser2>(result);

                return Single(updatedUser);
            }
            catch (Exception e)
            {
                return Message<AdminUser2>(false, e.Message);
            }
        }

        [WebGet(UriTemplate = "/information/read")]
        public Task<Response<AccountInformation>> GetAccountInformation()
        {
            var currentUser = _authHelper.GetCurrentUser();

            return Single(Mapper.Map<AccountInformation>(currentUser));
        }

        [WebInvoke(Method = "POST", UriTemplate = "/information/update")]
        public Task<Response<AccountInformation>> UpdateAccountInformation(AccountInformation accountInformation)
        {
            try
            {
                var currentUser = _authHelper.GetCurrentUser();
                var userId = currentUser.UserId;

                if (!string.IsNullOrWhiteSpace(accountInformation.NewPassword) && accountInformation.NewPassword == accountInformation.ConfirmPassword)
                {
                    var passwordInfo = Mapper.Map<AdminUser.Contracts.PasswordInfo>(accountInformation);
                    var response = _usersRepo.ChangePassword(passwordInfo, userId).Result;

                    if (!response.ResponseMessage.IsSuccessStatusCode)
                        return Message<AccountInformation>(false, response.ReadException().Message);
                }

                var result = UpdateUser(accountInformation, userId);

                return Single(Mapper.Map<AccountInformation>(result));
            }
            catch (Exception ex)
            {
                return Message<AccountInformation>(false, ex.Message);
            }
        }

        private Core.Api.Contracts.User UpdateUser(AccountInformation accountInformation, string userId)
        {
            var contractsUser = _usersRepo.GetUser(userId, null).Result.ReadAsAsync().Result;
            contractsUser.FirstName = accountInformation.FirstName;
            contractsUser.LastName = accountInformation.LastName;
            contractsUser.EmailAddress = accountInformation.Email;

            return _usersRepo.UpdateUser(contractsUser, userId).Result.ReadAsSync();
        }

        internal bool UserExists(LoginUser user)
        {
            if (string.IsNullOrEmpty(user.EmailAddress))
            {
                return false;
            }
             
           // var rootUserRepo = new AdminUserWebApiClient(new ServiceClientMessageHandler2(new ApiContext() { SiteId = VOLUSIONSITEID, TenantId = VOLUSIONTENANTID }));
            var res = _usersRepo.GetUserByEmail(user.EmailAddress, null).Result;
            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                var du = res.ReadAsSync();
                return du != null && du.EmailAddress != null;
            }
            return false;
        }
        internal void UpdateForgottenPassword(LoginUser user)
        {
            //var rootUserRepo = new AdminUserWebApiClient(new ServiceClientMessageHandler2(new ApiContext() { SiteId = VOLUSIONSITEID, TenantId = VOLUSIONTENANTID }));
            var res = _usersRepo.UpdateForgottenPassword(new ConfirmationInfo()
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

        internal void CreatePasswordResetRequest(string email)
        {

          //  var rootUserRepo = new AdminUserWebApiClient(new ServiceClientMessageHandler2(new ApiContext() { SiteId = VOLUSIONSITEID, TenantId = VOLUSIONTENANTID }));
            var res = _usersRepo.ResetPassword(new ResetPasswordInfo() { EmailAddress = email }).Result;
            if (res.HasException)
            {
                throw res.ReadException();
            }
        }
    }
}