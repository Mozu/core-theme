using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Autofac;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using NSubstitute;
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
             Autofac.ContainerBuilder builder = new ContainerBuilder();

             builder.RegisterType<SiteBuilderApiContext>().As<Mozu.Core.IApiContext>().As<ISiteBuilderApiContext>().InstancePerLifetimeScope();

            // _cartWebApiClient = Substitute.For<ICartWebApiClient>();
         }

    }
}
