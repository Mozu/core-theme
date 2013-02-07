using System.Threading.Tasks;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Admin
{
    public class ContextSwitcher : IContextSwitcher
    {
        private readonly ITenantsWebApiClient _tenantsWebApiClient;
        private readonly ISitesWebApiClient _sitesWebApiClient;
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly ISiteBuilderContext _siteBuilderContext;
        private readonly ISettings _settings;

        public ContextSwitcher(ITenantsWebApiClient tenantsWebApiClient, ISitesWebApiClient sitesWebApiClient, IAuthenticationHelper authenticationHelper, ISiteBuilderContext siteBuilderContext, ISettings settings)
        {
            _tenantsWebApiClient = tenantsWebApiClient;
            _sitesWebApiClient = sitesWebApiClient;
            _authenticationHelper = authenticationHelper;
            _siteBuilderContext = siteBuilderContext;
            _settings = settings;
        }

        public async Task<Tenant.Contracts.Tenant> ChangeTenant(int tenantId)
        {
            var tenant = await _tenantsWebApiClient.GetTenant(tenantId).Result.ReadAsAsync();
            var repo = new AuthTicketWebApiClient(new ServiceClientMessageHandler(new ApiContext() { TenantId = tenantId }, _settings));
            var ticket = _authenticationHelper.GetCurrentTicket();

            ticket = await repo.RefreshUserAuthTicket(ticket.RefreshToken).Result.ReadAsAsync();
            var userAuthTicketForTenant = repo.CreateAuthTicketForTenant(new UserTokenInfo { AccessToken = ticket.AccessToken }).Result.ReadAsAsync().Result;

            _authenticationHelper.SetCurrentUser(userAuthTicketForTenant);

            _siteBuilderContext.SiteId = null;
            _siteBuilderContext.SiteGroupId = null;
            _siteBuilderContext.TenantId = tenantId;
            _siteBuilderContext.Save();

            return tenant;
        }

        public async Task<Site> ChangeSite(int siteId)
        {
            var site = _sitesWebApiClient.GetSite(siteId).Result.ReadAsSync();
            var repo = new AuthTicketWebApiClient(new ServiceClientMessageHandler(new ApiContext() { SiteId = siteId, TenantId = site.TenantId }, _settings));
            var ticket = _authenticationHelper.GetCurrentTicket();

            ticket = await repo.RefreshUserAuthTicket(ticket.RefreshToken).Result.ReadAsAsync();
            ticket = await repo.CreateAuthTicketForSite(new UserTokenInfo { AccessToken = ticket.AccessToken }).Result.ReadAsAsync();
            _authenticationHelper.SetCurrentUser(ticket);

            var lwU = LightweightUserClaims.Parse(ticket.AccessToken);
            _siteBuilderContext.SiteId = (int)lwU.SiteId;
            _siteBuilderContext.TenantId = site.TenantId;
            _siteBuilderContext.Save();
            return site;
        }
    }
}