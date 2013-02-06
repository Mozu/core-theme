using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.Core.Api.Contracts.Client;
using Mozu.SiteBuilder.UX.Models.Admin;
using Mozu.Tenant.Contracts.Clients;

namespace Mozu.SiteBuilder.Mvc.Providers
{
    public class TaContextProvider : ITaContextProvider
    {
        private readonly ITenantsWebApiClient _tenantsWebApiClient;
        private readonly ISiteBuilderContext _siteBuilderContext;

        public TaContextProvider(ITenantsWebApiClient tenantsWebApiClient, ISiteBuilderContext siteBuilderContext)
        {
            _tenantsWebApiClient = tenantsWebApiClient;
            _siteBuilderContext = siteBuilderContext;
        }


        public TaContext GetContext(Tenant.Contracts.Tenant tenant)
        {
            throw new NotImplementedException();
        }
    }

    public interface ITaContextProvider
    {
        TaContext GetContext(Mozu.Tenant.Contracts.Tenant tenant);
    }
}
