using Autofac;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc;
using NUnit.Framework;

namespace Mozu.SiteBuilder.IntegrationTests.Hypr
{
    [TestFixture]
    public class IncludeContext
    {
        private ILifetimeScope _lifetimeScope;

        [TestFixtureSetUp]
        public void TestFixtureSetUp()
        {
            var builder = new ContainerBuilder();

            builder.RegisterType<SiteBuilderApiContext>().As<IApiContext>().As<ISiteBuilderApiContext>().InstancePerLifetimeScope();

            // _cartWebApiClient = Substitute.For<ICartWebApiClient>();
        }
    }
}