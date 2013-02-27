using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Settings;
using Mozu.Core.User;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.Tenant.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Helpers
{
    public class RolesHelper : IRolesHelper
    {
        private readonly IAdminUserWebApiClient _adminUserWebApiClient;
        private readonly IUniversalSiteApiClient _universalSiteApiClient;
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly ISettings _settings;
        private readonly IRoleWebApiClient _roleWebApi;


        public RolesHelper(IAdminUserWebApiClient adminUserWebApiClient, IUniversalSiteApiClient universalSiteApiClient, IAuthenticationHelper authenticationHelper, ISettings settings , IRoleWebApiClient roleWebApi )
        {
            _adminUserWebApiClient = adminUserWebApiClient;
            _universalSiteApiClient = universalSiteApiClient;
            _authenticationHelper = authenticationHelper;
            _settings = settings;
            _roleWebApi = roleWebApi;
        }

        public List<Tuple<Site, int>> SiteRolesList(string userId)
        {
            var rolesTask = _adminUserWebApiClient.GetUserRoles(userId, null).Result;
            var roles = rolesTask.ResponseMessage.IsSuccessStatusCode ? rolesTask.ReadAsSync() : new Core.Api.Contracts.RoleCollection() { Items = new List<Core.Api.Contracts.Role>() };
            var siteIds = roles.Items.Select(x => (int?)x.UserScope.Id );
            var sites = _universalSiteApiClient.GetSites(0, int.MaxValue, null, string.Join(" or ", siteIds.Select(x => "id eq " + x))).Result.ReadAsSync();
            var res = roles.Items.Select(role => new Tuple<Site, int>(sites.Items.FirstOrDefault(site => site.Id == role.UserScope.Id), role.Id))
                           .Where(x => x.Item1 != null).OrderByDescending(x => x.Item1.TenantId).ToList();

            return res;
        }

        public bool RemoveRoleFromSite(int siteId, int roleId)
        {
            LightweightUserClaims user = _authenticationHelper.GetCurrentUser();
            var site = _universalSiteApiClient.GetSite(siteId).Result.ReadAsSync();

            //var userThing = new UserWebApiClient(new ServiceClientMessageHandler2(new ApiContext() { SiteId = site.Id, TenantId = site.TenantId }));
            //userThing.DeleteUserRoleForTenant(user.UserId, roleId);
           
          //  var roleThing = new RoleWebApiClient(new ServiceClientMessageHandler(new ApiContext() { SiteId = site.Id, TenantId = site.TenantId, UserClaims = userClaims }, _settings));

            _roleWebApi.With(x => x.SiteId = site.Id).DeleteRole(roleId);
           // roleThing.DeleteRole(roleId);

            return true;
        }
    }
}