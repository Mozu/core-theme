using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using NSubstitute;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.StoreFront.Controllers
{
    [TestFixture]
    public class HomeControllerTests
    {
        [TestCase(10, true, "Crawl-delay: 10")]
        [TestCase(-1, false, "")]
        [Test]
        public void HasNoFollowInRobotsText(int val, bool hasRobots, string test)
        {
            string existing = "asdf\nblarg";
            var res = HomeController.AppendCrawlDelay(val, existing);
            if (!hasRobots)
            {
                Assert.IsFalse(res.Contains("Crawl-delay", StringComparison.OrdinalIgnoreCase));
            }
            else
            {
                Assert.IsTrue(res.Contains(test));
            }
            
        }

        [TestCase(10, 5, 10)]
        [TestCase(null, 5,5)]
        [TestCase(-1, 5,-1)]
        [Test]
        public void CanLookupCrawlDelay(int? tenantVal, int? settingVal, int expect)
        {
            var settings = Substitute.For<ISettings>();
            settings.AppSettings(HomeController.CrawlDelayConfigKey).Returns(settingVal?.ToString());
            var tenantApi = Substitute.For<ITenantsWebApiClient>();
            var tenant = new Tenant.Contracts.Tenant()
                {
                    Attributes = new List<TenantAttribute>()
                }
                ;
            if (tenantVal.HasValue)
            {
                tenant.Attributes.Add(new TenantAttribute()
                {
                    Name = HomeController.CrawlDelayConfigKey,
                    Value = tenantVal.ToString()
                });
            }

            var message = new ServiceClientResponse<Tenant.Contracts.Tenant>()
            {
                ReadAsSync = () => tenant
            };
            var ret = Task.FromResult(message);
            //tenantApi.Clone<ITenantsWebApiClient>().Returns(tenantApi);
            tenantApi.GetTenantInternal(tenantVal).ReturnsForAnyArgs(ret);
            var cache = new MemoryCache(new MemoryCacheOptions());
            var res = HomeController.GetCrawlDelay(1, settings, tenantApi, cache).Result;
            Assert.AreEqual(res,expect);
        }
    }
}