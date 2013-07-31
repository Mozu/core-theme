using System;
using System.Threading.Tasks;
using Mozu.AdminUser.Contracts;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.Tenant.Contracts.Clients;
using Mozu.User.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Admin.Helpers
{
    public class ContextSwitcher : IContextSwitcher
    {
        private readonly ITenantsWebApiClient _tenantsWebApiClient;
        private readonly ISitesWebApiClient _sitesWebApiClient;
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly ISiteBuilderContext _siteBuilderContext;
        
        private readonly ISettings _settings;
        private readonly ISiteBuilderApiContext  _context;
        private readonly Mozu.AdminUser.Contracts.Clients.IMultiScopeAdminAuthTicketWebApiClient  _authTicketWeb;

        public ContextSwitcher(ITenantsWebApiClient tenantsWebApiClient, ISitesWebApiClient sitesWebApiClient, IAuthenticationHelper authenticationHelper, ISiteBuilderContext siteBuilderContext, ISettings settings, ISiteBuilderApiContext context, IMultiScopeAdminAuthTicketWebApiClient authTicketWeb)
        {
            _tenantsWebApiClient = tenantsWebApiClient.CloneWithoutUserClaims();
;            _sitesWebApiClient = sitesWebApiClient.CloneWithoutUserClaims();
            _authenticationHelper = authenticationHelper;
            _siteBuilderContext = siteBuilderContext;
            _settings = settings;
            _context = context;
            _authTicketWeb = authTicketWeb.CloneWithoutUserClaims();
        }

        public async Task<Tenant.Contracts.Tenant> ChangeTenant(int tenantId)
        {
         
            //Mozu.Core.Api.Client.ServiceClientExtensions 
            var tenant = (await _tenantsWebApiClient.GetTenant(tenantId))   .ReadAsSync();

            var ticket = _authenticationHelper.GetAuthTicket();
            var claim = LightweightUserClaims.Parse(ticket.AccessToken);


            var authTicketForTenant= _authTicketWeb.RefreshUserAuthTicket(
                
                
                
                existingAuthTicket: new MultiScopeAdminUserAuthTicket()
                                        {
                                            AccessToken = ticket.AccessToken,
                                            RefreshToken = ticket.RefreshToken
                                        },
                scopeType: UserScopeType.Tenant.ToString(),
                scopeId: tenantId
                );

            var userAuthTicketForTenant = (await authTicketForTenant).ReadAsSync();


            _authenticationHelper.SaveAuthTicket(userAuthTicketForTenant);
            claim = LightweightUserClaims.Parse(userAuthTicketForTenant.AccessToken);
            

            _authenticationHelper.SaveAuthTicket( userAuthTicketForTenant);
            _context.SetUser(claim);
            _siteBuilderContext.SiteId = null;
            _siteBuilderContext.SiteGroupId = null;
            _siteBuilderContext.TenantId = tenantId;
            _siteBuilderContext.Save();

            return tenant;
        }
    }
}