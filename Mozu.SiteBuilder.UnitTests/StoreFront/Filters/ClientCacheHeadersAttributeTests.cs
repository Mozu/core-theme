using System.Reflection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using NSubstitute;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.StoreFront.Filters
{
    [TestFixture]
    public class ClientCacheHeadersAttributeTests
    {
        [Test]
        public void ClientCacheHeadersAttribute_SetsNoCache()
        {
            var ff = new ClientCacheHeadersAttribute()
            {
                ForceRevalidate = true
            } as IFilterFactory;
            var mvcOpts = Options.Create<MvcOptions>(new MvcOptions());
            var settings = Substitute.For<ISettings>();
            var logger = Substitute.For<ILoggerFactory>();
            var sp = new ServiceCollection()
                .AddSingleton<ISettings>(settings)
                .AddSingleton<ILoggerFactory>(logger)
                .AddSingleton<IOptions<MvcOptions>>(mvcOpts)
                .BuildServiceProvider();
            var filter = ff.CreateInstance(sp);
            var nostore = (bool)filter.GetType().GetProperty("NoStore", BindingFlags.Public | BindingFlags.Instance).GetMethod
                .Invoke(filter, new object[] { });
            Assert.IsTrue(nostore);

        }
        [Test]
        public void ClientCacheHeadersAttribute_SetDuration()
        {
            var ff = new ClientCacheHeadersAttribute()
            {
                ConfigKey = "images",
            } as IFilterFactory;
            var mvcOpts = Options.Create<MvcOptions>(new MvcOptions());
            var settings = Substitute.For<ISettings>();
            settings.AppSettings("clientCacheHeaderLength:images").Returns("2000");
            var logger = Substitute.For<ILoggerFactory>();
            var sp = new ServiceCollection()
                .AddSingleton<ISettings>(settings)
                .AddSingleton<ILoggerFactory>(logger)
                .AddSingleton<IOptions<MvcOptions>>(mvcOpts)
                .BuildServiceProvider();
            var filter = ff.CreateInstance(sp);
            var nostore = (bool)filter.GetType().GetProperty("NoStore", BindingFlags.Public | BindingFlags.Instance).GetMethod
                .Invoke(filter, new object[] { });
            var duration = (int)filter.GetType().GetProperty("Duration", BindingFlags.Public | BindingFlags.Instance).GetMethod
                .Invoke(filter, new object[] { });
            
            
            Assert.IsFalse(nostore);
            Assert.AreEqual(2000,duration);

        }
    }
}