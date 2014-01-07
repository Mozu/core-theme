using System.Threading;
using Mozu.Core.Api.Contracts.Provisioning;
using Mozu.Core.Api.Routing;
using Mozu.Core.Behaviors;
using Mozu.Provisioning.Contracts.Clients;
using Mozu.Reporting.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core.Api.Client;
using Mozu.Tenant.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/provisioning", SuppressDescriptorGeneration = true)]
    public class ProvisioningController : BaseController
    {
        private readonly IProvisioningWebApiClient _provisioningWebApiClient;
        private readonly ITenantsWebApiClient _tenantsWebApiClient;


        public ProvisioningController(Mozu.Provisioning.Contracts.Clients.IProvisioningWebApiClient provisioningWebApiClient, Mozu.Tenant.Contracts.Clients.ITenantsWebApiClient tenantsWebApiClient)
        {
            _provisioningWebApiClient = provisioningWebApiClient;
            
            _tenantsWebApiClient = tenantsWebApiClient.CloneWithoutUserClaims();
        }
        //137
        public class ProvisionRequest{
            public int  MasterCatalogId{ get; set; }
            public string    SiteName { get; set; }
        }

        [HttpPostRoute(UriTemplate = "provision")]
        public async Task<bool> Provision(ProvisionRequest request)
        {
            var tenantInfo = (await _tenantsWebApiClient.GetTenant(this.SbApiContext.TenantId)).ReadAsSync();
            var masterCatInfo = tenantInfo.MasterCatalogs.First(x => x.Id == request.MasterCatalogId);
            var res = await _provisioningWebApiClient.ProvisionSite(new CreateSiteRequest()
                                                                    {
                                                                        CatalogRequest = new CreateCatalogRequest()
                                                                                         {
                                                                                             DefaultCurrencyCode = masterCatInfo.DefaultCurrencyCode,

                                                                                             DefaultLocaleCode = "en-US",
                                                                                             MasterCatalogId = masterCatInfo.Id,
                                                                                             Name = request.SiteName,
                                                                                             TenantId = SbApiContext.TenantId
                                                                                         },
                                                                        CountryCode = "us",
                                                                        CurrencyCode = masterCatInfo.DefaultCurrencyCode,
                                                                        IsMozuStorefront = true,
                                                                        MasterCatalogId = request.MasterCatalogId ,
                                                                        LocaleCode = "en-US",

                                                                        Name = request.SiteName,
                                                                        TenantId = SbApiContext.TenantId
                                                                    });
            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                return true;
            }
            throw res.ReadException();
        }

    }
}
