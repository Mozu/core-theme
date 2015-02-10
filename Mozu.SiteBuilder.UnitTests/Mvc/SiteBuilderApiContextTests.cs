using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Security;
using NSubstitute;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UnitTests.Mvc
{

    [Category("Context")]
    [TestFixture]
    public class SiteBuilderApiContextTests
    {

        [Test]
        public void Can_Set_Now_override_In_Staging_Via_QS()
        {
            ICookieProvider cookieProvider = Substitute.For<ICookieProvider>();

            ISettings settings = Substitute.For<ISettings>();
            IAuthenticationHelper auth = Substitute.For<IAuthenticationHelper>();
            HttpRequestMessage request = Substitute.For<HttpRequestMessage>();
            request.Headers.Add("x-vol-dataview-mode", "Pending");
            request.RequestUri = new Uri("http://foo.com/?mz_now=2012-11-10");
            var ctx = new Mozu.SiteBuilder.Mvc.SiteBuilderApiContext(cookieProvider, settings, auth, request);
            Assert.AreEqual(ctx.Now.Year, 2012);
            Assert.AreEqual(ctx.Now.Month, 11);
            Assert.AreEqual(ctx.Now.Day, 10);

        }
        [Test]
        public void Catn_Set_Now_override_In_Live_Via_QS()
        {
            ICookieProvider cookieProvider = Substitute.For<ICookieProvider>();

            ISettings settings = Substitute.For<ISettings>();
            IAuthenticationHelper auth = Substitute.For<IAuthenticationHelper>();
            HttpRequestMessage request = Substitute.For<HttpRequestMessage>();
            request.RequestUri = new Uri("http://foo.com/?mz_now=2012-11-10");
            var ctx = new Mozu.SiteBuilder.Mvc.SiteBuilderApiContext(cookieProvider, settings, auth, request);
            Assert.AreNotEqual(ctx.Now.Year, 2012);

        }

    }
}
