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
            var dvm = Substitute.For<IDataViewModeFinderOuter>();
            dvm.GetDataViewMode().Returns(Core.DataViewModeType.Pending);
            var edit = Substitute.For<IEditModeFinderOuter>();
            edit.IsEditMode().Returns(false);
            HttpRequestMessage request = Substitute.For<HttpRequestMessage>();

            request.RequestUri = new Uri("http://foo.com/?mz_now=2012-11-10");
            var ctx = new Mozu.SiteBuilder.Mvc.SiteBuilderApiContext(cookieProvider, settings, auth, request, dvm, edit);
            
            var now = ctx.Now.Value;
            Assert.AreEqual(now.Year, 2012);
            Assert.AreEqual(now.Month, 11);
            Assert.AreEqual(now.Day, 10);

        }
        [Test]
        public void Can_Set_Now_override_In_Live_Via_QS()
        {
            ICookieProvider cookieProvider = Substitute.For<ICookieProvider>();

            ISettings settings = Substitute.For<ISettings>();
            IAuthenticationHelper auth = Substitute.For<IAuthenticationHelper>();
            HttpRequestMessage request = Substitute.For<HttpRequestMessage>();
            var dvm = Substitute.For<IDataViewModeFinderOuter>();
            dvm.GetDataViewMode().Returns(Core.DataViewModeType.Live);
            var edit = Substitute.For<IEditModeFinderOuter>();
            edit.IsEditMode().Returns(false);
            request.RequestUri = new Uri("http://foo.com/?mz_now=2012-11-10");
            var ctx = new Mozu.SiteBuilder.Mvc.SiteBuilderApiContext(cookieProvider, settings, auth, request, dvm, edit);
            Assert.AreNotEqual(ctx.Now.Value.Year, 2012);

        }

    }
}
