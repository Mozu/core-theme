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
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Routing;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using AdminUser2 = Mozu.SiteBuilder.UX.Admin.Api.Models.Account.User;
using ApiRole = Mozu.Core.Api.Contracts.Role;

using IInvitationWebApiClient = Mozu.AdminUser.Contracts.Clients.IMultiScopeInvitationWebApiClient ;
using Invitation = Mozu.SiteBuilder.UX.Admin.Api.Models.Account.Invitation;
using IMultiScopeRoleWebApiClient = Mozu.AdminUser.Contracts.Clients.IMultiScopeRoleWebApiClient;
//using DC = Mozu.Core.Api.Contracts;
using PasswordInfo = Mozu.SiteBuilder.UX.Admin.Api.Models.Account.PasswordInfo;
using Role = Mozu.SiteBuilder.UX.Models.Users.Role;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [AllowAnonymous]
    [WebApi("app/account", SuppressDescriptorGeneration = true)]
    public class AccountController : BaseController, IHttpController
    {
        private List<ApiRole> _roles;

        private readonly IMultiScopeAdminUserWebApiClient _usersRepo;
        private readonly IMultiScopeRoleWebApiClient _rolesRepo;
        private readonly ITenantsWebApiClient _tenantsClient;
        private readonly IAuthenticationHelper _authHelper;
        private IInvitationWebApiClient _invitationWebApiClient;
        private readonly  IMultiScopeAdminUserWebApiClient _adminUserWebApiClient;
        private readonly ISettings _settings;
      
        private readonly IUserHelper _userHelper;
        private readonly IApiContext _apiContext;

        public AccountController(IMultiScopeAdminUserWebApiClient user, IMultiScopeRoleWebApiClient role,  ITenantsWebApiClient tenantsClient , IAuthenticationHelper authHelper,  IInvitationWebApiClient invitationWebApiClient, IMultiScopeAdminUserWebApiClient adminUserWebApiClient,  ISettings settings,  IUserHelper userHelper, IApiContext apiContext)
        {
            _usersRepo = user;
            _rolesRepo = role;
            _tenantsClient = tenantsClient;
            _authHelper = authHelper;
            _adminUserWebApiClient = adminUserWebApiClient;
            _invitationWebApiClient = invitationWebApiClient;
            _settings = settings;
     
            _userHelper = userHelper;
            _apiContext = apiContext;
        }

    
        
        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<AdminUser2>>> GetUsers([FromUri]PagingParamaters pagingParams, FilterCollection extFilter)
        {
            var tasks= new List<Task<ServiceClientResponse<Core.Api.Contracts.User>>>();
            if (pagingParams.id != null)
            {
                tasks.Add(_usersRepo.GetUser((string)pagingParams.id, scopeType: UserScopeType.Tenant.ToString(), scopeId: _apiContext.TenantId));
                 
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
            LightweightUserClaims lwU = _apiContext.UserClaims;
      
            var u = (await _usersRepo.GetUser(lwU.UserId, null)).ReadAsSync();

            return List2(Mapper.Map<AdminUser2>(u));
        }

        [HttpGetRoute(UriTemplate = "roles/list")]
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

            var roles = (await _rolesRepo.GetRoles(scopeType: UserScopeType.Tenant.ToString(), scopeId: _apiContext.TenantId)).ReadAsSync();
            return _roles = roles.Items;
        }

      
        [HttpPostRoute(UriTemplate = "users/delete")]
        public async Task<Response<AccountUser>> DeleteUser(AccountUser accountUser)
        {
            var dcUser = (await _adminUserWebApiClient.GetUserRoles(accountUser.Id, scopeType: "Tenant", scopeId: _apiContext.TenantId)).ReadAsSync();

            await Task.WhenAll(dcUser.Items.Select(role => _adminUserWebApiClient.RemoveUserRole(accountUser.Id, role.RoleId, scopeType: UserScopeType.Tenant.ToString(), scopeId: _apiContext.TenantId)));

            //await _adminUserWebApiClient.RemoveUserRole(accountUser.Id, accountUser.RoleId, scopeType: UserScopeType.Tenant.ToString(), scopeId: _apiContext.TenantId);

            return EmptySingle2<AccountUser>();
        }

        [HttpPostRoute(UriTemplate = "invitations/delete")]
        public async Task<Response<Invitation>> DeleteInvitation(Invitation invitation)
        {
            await _invitationWebApiClient.DeclineInvitation(invitation.Id);

            return Single2(invitation);
        }

        

        [HttpPostRoute(UriTemplate = "invitations/create")]
        public async Task<Response<Invitation>> CreateInvitation(Newtonsoft.Json.Linq.JObject request)
        {
            try
            {
                var tenant = (await _tenantsClient.GetTenant(_apiContext.TenantId)).ReadAsSync();
                // Serialized to string
                var json = JsonConvert.SerializeObject(request, Formatting.Indented,
                    new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });

                // Deserialize
                var inv = JsonConvert.DeserializeObject<Invitation>(json,
                    new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });

                // Parse json and stuff
                var newInv = JValue.Parse(json);
                dynamic newInvDynamic = newInv;
                var newInvDynamicJArray = newInvDynamic.roleIds as JArray;

                var rolesIds = newInvDynamicJArray != null ? newInvDynamicJArray.ToObject<List<int>>() : new List<int>();
                var id = newInvDynamic.id;
                var email = newInvDynamic.email;
                var result = (await _invitationWebApiClient.CreateInvitation(new AdminUser.Contracts.Invitation()
                {
                    EmailAddress = email,
                    UserScopeType = UserScopeType.Tenant.ToString(),
                    ScopeName = tenant.Name,
                    UserScopeId = _apiContext.TenantId,
                    InvitationRoles = rolesIds//request.Value<List<int>>("roleIds"),
                })).ReadAsSync();
                var newInvitation = Mapper.Map<AdminUser.Contracts.Invitation, Invitation>(result);

                return Single2(newInvitation);
            }
            catch (Exception e)
            {
                return Message3<Invitation>(false, e.Message);
            }
        }

        [HttpGetRoute(UriTemplate = "users/list")]
        public async Task<Response<List<AccountUser>>> GetAccountUsers()
        {
            
            var admins = (await _adminUserWebApiClient.GetUsers(scopeType: UserScopeType.Tenant.ToString(), scopeId: _apiContext.TenantId, startIndex: 0, pageSize: 600, responseGroups: "Roles")).ReadAsSync().Items;
            var invites = (await _invitationWebApiClient.GetInvitations(scopeType: UserScopeType.Tenant.ToString(), scopeId: _apiContext.TenantId, filter: "state ne confirmed")).ReadAsSync().Items;
            var invitations = Mapper.Map<List<Invitation>>(invites);
            foreach (var invitation in invitations)
            {
                //ToDo: refactor this BF
                var role = (await GetRolesInternal()).FirstOrDefault(r => r.Id == invitation.RoleIds[0]);
                invitation.Role  = role == null ? "(unknown)" : role.Name;
            }

            var users = admins.Select(Mapper.Map<AccountUser>).Concat(
                invitations.Select(Mapper.Map<AccountUser>)).ToList();

            return List2(users);
        }

        [HttpPostRoute(UriTemplate = "invitations/resend")]
        public async Task<Response<Invitation>> ResendInvitation(Invitation invitation)
        {
            await _invitationWebApiClient.ResubmitInvitation(invitation.Id);

            return Single2(invitation);
        }

        [HttpPostRoute(UriTemplate = "users/updaterole")]
        public async Task<Response<AccountUserRoleUpdate>> UpdateAccountUser(AccountUserRoleUpdate info)
        {
            try
            {
                var dcRoles = (await _adminUserWebApiClient.GetUserRoles(info.UserId, scopeType: UserScopeType.Tenant.ToString(), scopeId: _apiContext.TenantId)).ReadAsSync();

                await Task.WhenAll(dcRoles.Items.Where(x => !info.Roles.Contains(x.RoleId)).Select(
                    x => 
                        _adminUserWebApiClient.RemoveUserRole(info.UserId, x.RoleId, scopeType: UserScopeType.Tenant.ToString(), scopeId: _apiContext.TenantId)
                    ).ToList());

                await Task.WhenAll(info.Roles.Where(x => !dcRoles.Items.Any(_ => _.RoleId == x)).Select(x => 
                    _adminUserWebApiClient.AddUserRole( info.UserId, x, scopeType: UserScopeType.Tenant.ToString(), scopeId: _apiContext.TenantId)).ToList());


                
            }
            catch (Exception e)
            {
                return Message3<AccountUserRoleUpdate>(false, e.Message);
            }

            return Single2(info);
        }

        [HttpPostRoute(UriTemplate = "password/update")]
        public async Task<Response<AdminUser2>> ChangePassword(PasswordInfo passwordInfo)
        {
            try
            {
                var newPasswordInfo = Mapper.Map<AdminUser.Contracts.PasswordInfo>(passwordInfo);
                var user = _apiContext.UserClaims;

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

        [HttpGetRoute(UriTemplate = "information/read")]
        public Response<AccountInformation> GetAccountInformation()
        {
            var currentUser = _apiContext.UserClaims;

            return Single2(Mapper.Map<AccountInformation>(currentUser));
        }

        [HttpPostRoute(UriTemplate = "information/update")]
        public async Task<Response<AccountInformation>> UpdateAccountInformation(AccountInformation accountInformation)
        {
            try
            {
                var currentUser = _apiContext.UserClaims;
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