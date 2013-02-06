using System.Collections.Generic;
using System.Linq;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Providers;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using NSubstitute;
using NUnit.Framework;
using Should;

namespace Mozu.SiteBuilder.IntegrationTests.Mvc.Providers
{
    [TestFixture]
    public class TaContextProviderTests
    {
        private ITenantsWebApiClient _tenantsWebApiClient;
        private ISiteBuilderContext _siteBuilderContext;
        private SiteCollection _siteCollection;

        [SetUp]
        public void SetUp()
        {
            _tenantsWebApiClient = Substitute.For<ITenantsWebApiClient>();
            _siteBuilderContext = Substitute.For<ISiteBuilderContext>();

            _siteCollection = new SiteCollection { Items = new List<Site>() };

            _tenantsWebApiClient.WithAny(x => x.GetSites(null), _siteCollection);
        }



        public TaContextProvider GetProvider()
        {
            return new TaContextProvider(_tenantsWebApiClient, _siteBuilderContext);
        }
    }
}