using System;
using System.Threading.Tasks;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.Tenant.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Admin.Helpers
{
    public class ContextSwitcher : IContextSwitcher
    {
        private readonly ITenantsWebApiClient _tenantsWebApiClient;
        private readonly ISitesWebApiClient _sitesWebApiClient;
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly ISiteBuilderContext _siteBuilderContext;
        
        private readonly ISettings _settings;
        private readonly IApiContext _context;
        private readonly IAuthTicketWebApiClient _authTicketWeb;

        public ContextSwitcher(ITenantsWebApiClient tenantsWebApiClient, ISitesWebApiClient sitesWebApiClient, IAuthenticationHelper authenticationHelper, ISiteBuilderContext siteBuilderContext, ISettings settings , IApiContext context, IAuthTicketWebApiClient authTicketWeb)
        {
            _tenantsWebApiClient = tenantsWebApiClient;
            _sitesWebApiClient = sitesWebApiClient;
            _authenticationHelper = authenticationHelper;
            _siteBuilderContext = siteBuilderContext;
            _settings = settings;
            _context = context;
            _authTicketWeb = authTicketWeb;
        }

        public async Task<Tenant.Contracts.Tenant> ChangeTenant(int tenantId)
        {
            //Mozu.Core.Api.Client.ServiceClientExtensions 
            var tenant = (await _tenantsWebApiClient.GetTenant(tenantId)).ReadAsSync();

            var ticket = _authenticationHelper.GetCurrentTicket();
            var claim = LightweightUserClaims.Parse(ticket.AccessToken);

            var authTicketForTenant = _authTicketWeb
                .With(TargetContextLevelType.Tenant)
                .With(x => x.TenantId = tenantId)
                .CreateAuthTicketForTenant(new UserTokenInfo { AccessToken = ticket.AccessToken });

            var userAuthTicketForTenant = (await authTicketForTenant).ReadAsSync();

            _authenticationHelper.SetCurrentUser(userAuthTicketForTenant);

            _siteBuilderContext.SiteId = null;
            _siteBuilderContext.SiteGroupId = null;
            _siteBuilderContext.TenantId = tenantId;
            _siteBuilderContext.Save();

            return tenant;
        }
    }
}