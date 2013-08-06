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
        private readonly IMultiScopeAdminUserWebApiClient _adminUserWebApiClient;
        private readonly IUniversalSiteApiClient _universalSiteApiClient;
        private readonly IPublicAdminUserWebApiClient _publicAdminUserWebApiClient;
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly ISettings _settings;
        private readonly IMultiScopeRoleWebApiClient _roleWebApi;
        private readonly IApiContext _apiContext;


        public RolesHelper(IMultiScopeAdminUserWebApiClient adminUserWebApiClient, IUniversalSiteApiClient universalSiteApiClient, IPublicAdminUserWebApiClient publicAdminUserWebApiClient, IAuthenticationHelper authenticationHelper, ISettings settings, IMultiScopeRoleWebApiClient roleWebApi, IApiContext apiContext)
        {
            _adminUserWebApiClient = adminUserWebApiClient;
            _universalSiteApiClient = universalSiteApiClient;
            _publicAdminUserWebApiClient = publicAdminUserWebApiClient;
            _authenticationHelper = authenticationHelper;
            _settings = settings;
            _roleWebApi = roleWebApi;
            _apiContext = apiContext;
        }

        public List<Mozu.Tenant.Contracts.Tenant> SiteRolesList(string userId)
        {
            var tenants = _publicAdminUserWebApiClient.GetTenantScopesForUser(userId).Result.ReadAsSync();
            return tenants.Items.ToList<Mozu.Tenant.Contracts.Tenant>();
        }

        public bool RemoveRoleFromSite(int siteId, int roleId)
        {
            throw new NotImplementedException();
        }
    }
}