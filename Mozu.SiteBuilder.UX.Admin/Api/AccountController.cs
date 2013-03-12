using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Controllers;
using AutoMapper;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Mozu.Tenant.Contracts.Clients;
using AdminUser2 = Mozu.SiteBuilder.UX.Admin.Api.Models.Account.User;
using ApiRole = Mozu.Core.Api.Contracts.Role;
using IAuthTicketWebApiClient = Mozu.AdminUser.Contracts.Clients.IAuthTicketWebApiClient;
using IInvitationWebApiClient = Mozu.AdminUser.Contracts.Clients.IInvitationWebApiClient;
using Invitation = Mozu.SiteBuilder.UX.Admin.Api.Models.Account.Invitation;
using IRoleWebApiClient = Mozu.AdminUser.Contracts.Clients.IRoleWebApiClient;
//using DC = Mozu.Core.Api.Contracts;
using PasswordInfo = Mozu.SiteBuilder.UX.Admin.Api.Models.Account.PasswordInfo;
using Role = Mozu.SiteBuilder.UX.Models.Users.Role;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    [AllowAnonymous]
    public class AccountController : BaseController, IHttpController
    {
        private List<ApiRole> _roles;

        private readonly IAdminUserWebApiClient _usersRepo;
        private readonly IRoleWebApiClient _rolesRepo;
        private readonly IAuthenticationHelper _authHelper;
        private IInvitationWebApiClient _invitationWebApiClient;
        private readonly  IAdminUserWebApiClient _adminUserWebApiClient;
        private readonly ISettings _settings;
        private readonly IContextSwitcher _contextSwitcher;
        private readonly IUserHelper _userHelper;

        public AccountController(IAdminUserWebApiClient user, IRoleWebApiClient role, IAuthTicketWebApiClient auth, ITenantsWebApiClient tenantsClient, IAuthenticationHelper authHelper, IUniversalSiteApiClient siteClient, IInvitationWebApiClient invitationWebApiClient, IAdminUserWebApiClient adminUserWebApiClient, ISiteBuilderContext siteBuilderContext, ISettings settings, IContextSwitcher contextSwitcher, IUserHelper userHelper)
        {
            _usersRepo = user;
            _rolesRepo = role;
            _authHelper = authHelper;
            _adminUserWebApiClient = adminUserWebApiClient;
            _invitationWebApiClient = invitationWebApiClient;
            _settings = settings;
            _contextSwitcher = contextSwitcher;
            _userHelper = userHelper;
        }

        [WebInvoke(UriTemplate = "logoff")]
        public Response<List<AdminUser2>> Logoff()
        {
            //var ticket = _authHelper.GetCurrentTicket();
            //_authTicketRepo.DeleteUserAuthTicket(ticket.RefreshToken).Result.ReadAsSync();
            _authHelper.LogOut();
            return EmptyList2<AdminUser2>();
        }
        
        [WebGet(UriTemplate = "list")]
        public async Task<Response<List<AdminUser2>>> GetUsers([FromUri]PagingParamaters pagingParams, FilterCollection extFilter)
        {
            var tasks= new List<Task<ServiceClientResponse<Core.Api.Contracts.User>>>();
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
            await Task.WhenAll(tasks.ToArray());
            List<AdminUser2> users = new List<AdminUser2>();
            foreach (var task in tasks)
            {
                if (task.Result.ResponseMessage.IsSuccessStatusCode)
                {
                    users.Add(Mapper.Map<AdminUser2>(task.Result.ReadAsSync()));
                }
            }
            return List2<AdminUser2>(users);
        }

        public async Task<Response<List<AdminUser2>>> GetAccount()
        {
            LightweightUserClaims lwU = _authHelper.GetCurrentUser();
            var ctx = Mvc.SiteBuilderContext.Current;
            var u = (await _usersRepo.GetUser(lwU.UserId, null)).ReadAsSync();

            return List2(Mapper.Map<AdminUser2>(u));
        }

        [WebGet(UriTemplate = "roles/list")]
        public async Task<Response<List<Role>>> GetRoles()
        {
            var list = (await GetRolesInternal()).Select(Mapper.Map<Role>).ToList();
            return List2(list);
        }

        // TODO: this is a lot of logic for a property..
        private async Task<List<ApiRole>> GetRolesInternal()
        {
            if (_roles != null)
                return _roles;

            var roles = (await _rolesRepo.GetRoles()).ReadAsSync();
            return _roles = roles.Items;
        }

        public async Task<Response<Tenant.Contracts.Tenant>> ChangeTenant(int tenantId)
        {
            var tenant = await _contextSwitcher.ChangeTenant(tenantId);

            return Single2(tenant);
        }

        //public async Task<Site> ChangeSite(int siteId)
        //{
        //    var site = await _contextSwitcher.ChangeSite(siteId);

        //    return site;
        //}


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

        [WebInvoke(Method = "POST", UriTemplate = "users/delete")]
        public async Task<Response<AccountUser>> DeleteUser(AccountUser accountUser)
        {
            await _adminUserWebApiClient.RemoveUserRole(accountUser.Id, accountUser.RoleId);

            return EmptySingle2<AccountUser>();
        }

        [WebInvoke(Method = "POST", UriTemplate = "invitations/delete")]
        public async Task<Response<Invitation>> DeleteInvitation(Invitation invitation)
        {
            await _invitationWebApiClient.DeclineInvitation(invitation.Id);

            return Single2(invitation);
        }

        [WebInvoke(Method = "POST", UriTemplate = "invitations/create")]
        public async Task<Response<Invitation>> CreateInvitation(Invitation invitation)
        {
            try
            {
                var result = (await _invitationWebApiClient.CreateInvitation(invitation.RoleId, invitation.EmailAddress)).ReadAsSync();
                var newInvitation = Mapper.Map<AdminUser.Contracts.Invitation, Invitation>(result);

                return Single2(newInvitation);
            }
            catch (Exception e)
            {
                return Message3<Invitation>(false, e.Message);
            }
        }

        [WebGet(UriTemplate = "users/list")]
        public async Task<Response<List<AccountUser>>> GetAccountUsers()
        {
            var admins = (await _adminUserWebApiClient.Get(null, null, null, null, null)).ReadAsSync().Items;
            var invites = (await _invitationWebApiClient.GetInvitations(null)).ReadAsSync().Items;
            var invitations = Mapper.Map<List<Invitation>>(invites);
            foreach (var invitation in invitations)
            {
                var role = (await GetRolesInternal()).FirstOrDefault(r => r.Id == invitation.RoleId);
                invitation.Role = role == null ? "(unknown)" : role.Name;
            }

            var users = admins.Select(Mapper.Map<AccountUser>).Concat(
                invitations.Select(Mapper.Map<AccountUser>)).ToList();

            return List2(users);
        }

        [WebInvoke(Method = "POST", UriTemplate = "invitations/resend")]
        public async Task<Response<Invitation>> ResendInvitation(Invitation invitation)
        {
            await _invitationWebApiClient.ResubmitInvitation(invitation.Id);

            return Single2(invitation);
        }

        [WebInvoke(Method = "POST", UriTemplate = "users/updaterole")]
        public async Task<Response<AccountUserRoleUpdate>> UpdateAccountUser(AccountUserRoleUpdate info)
        {
            try
            {
                var remove = _adminUserWebApiClient.RemoveUserRole(info.UserId, info.OldRole);
                var add = _adminUserWebApiClient.AddUserRole(info.UserId, info.NewRole);
                await Task.WhenAll(remove, add);
            }
            catch (Exception e)
            {
                return Message3<AccountUserRoleUpdate>(false, e.Message);
            }

            return Single2(info);
        }

        [WebInvoke(Method = "POST", UriTemplate = "password/update")]
        public async Task<Response<AdminUser2>> ChangePassword(PasswordInfo passwordInfo)
        {
            try
            {
                var newPasswordInfo = Mapper.Map<AdminUser.Contracts.PasswordInfo>(passwordInfo);
                var user = _authHelper.GetCurrentUser();

                await _usersRepo.ChangePassword(newPasswordInfo, user.UserId);

                var result = (await _usersRepo.GetUser(user.UserId, null)).ReadAsSync();
                var updatedUser = Mapper.Map<AdminUser2>(result);

                return Single2(updatedUser);
            }
            catch (Exception e)
            {
                return Message3<AdminUser2>(false, e.Message);
            }
        }

        [WebGet(UriTemplate = "information/read")]
        public Response<AccountInformation> GetAccountInformation()
        {
            var currentUser = _authHelper.GetCurrentUser();

            return Single2(Mapper.Map<AccountInformation>(currentUser));
        }

        [WebInvoke(Method = "POST", UriTemplate = "information/update")]
        public async Task<Response<AccountInformation>> UpdateAccountInformation(AccountInformation accountInformation)
        {
            try
            {
                var currentUser = _authHelper.GetCurrentUser();
                var userId = currentUser.UserId;

                if (!string.IsNullOrWhiteSpace(accountInformation.NewPassword) && accountInformation.NewPassword == accountInformation.ConfirmPassword)
                {
                    var passwordInfo = Mapper.Map<AdminUser.Contracts.PasswordInfo>(accountInformation);
                    var response = await _usersRepo.ChangePassword(passwordInfo, userId);

                    if (!response.ResponseMessage.IsSuccessStatusCode)
                        return Message3<AccountInformation>(false, response.ReadException().Message);
                }

                var result = _userHelper.UpdateUser(accountInformation, userId);

                return Single2(Mapper.Map<AccountInformation>(result));
            }
            catch (Exception ex)
            {
                return Message3<AccountInformation>(false, ex.Message);
            }
        }
    }
}