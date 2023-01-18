using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Mobile;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.Tags;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NSubstitute;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Mozu.Core;
using Microsoft.Extensions.Logging;
using Mozu.Tenant.Contracts;

namespace Mozu.SiteBuilder.UnitTests.Mvc
{



    [Category("Context")]
    [TestFixture]
    public class PageContextTests
    {

        [Test]
        public void Can_Serilize_PageContext_Location()
        {
            var sbCtxt = Substitute.For<ISiteBuilderApiContext>();
            var mobileDetectionProvider = Substitute.For<IMobileDetectionProvider>();
            
            var siteContext = Substitute.For<ISiteContext>();
            var pc = PageContext.CreateForTesting(sbCtxt, mobileDetectionProvider,siteContext);
            pc.ThemeId = "asdf";
            pc.Visit = new UX.Models.Visit.Visit()
            {
                VisitorId = "sklj;jlkfgd nl"
            };
            pc.CdnCacheBustKey = "asdf";
            pc.User = new UX.Models.Customers.User()
            {
                AccountId = 45644768
            };
            pc.Search = SearchContext.CreateForTest();
            pc.CmsContext = new UX.Models.Admin.CMS.CmsPageContext()
            {
                Page = new UX.Models.Admin.CMS.DocumentRequest()
                {
                    Id = "khsfdgsfdg"
                }
            };
            pc.PurchaseLocation = new LocationInfo()
            {
                Code = "asdff"
            };
            pc.UserProfile = new Core.UserProfile()
            {
                UserId = "ghfjfghj"
            };
         


           
            var page = JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings
            {
                ContractResolver = JsonPreloadeContractResolver.DefaultResolver,
                StringEscapeHandling = StringEscapeHandling.EscapeHtml
            });

            var cookie = JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings
            {
                ContractResolver = JsonPreloadeCookieContractResolver.CookieResolver,
                StringEscapeHandling = StringEscapeHandling.EscapeHtml
            });
            var tw = new StringWriter();
            var jwt = new JsonTextWriter(tw);
            page.Serialize(jwt,pc);
          // var pageTxt = tw.GetStringBuilder().ToString();
            var pageJobj = JObject.Parse(tw.GetStringBuilder().ToString());


            tw = new StringWriter();
            jwt = new JsonTextWriter(tw);
            cookie.Serialize(jwt, pc);
            var cookieTxt = tw.GetStringBuilder().ToString();
            var cookieObj = JObject.Parse(tw.GetStringBuilder().ToString());

            Assert.AreEqual(pc.PurchaseLocation.Code, (string)cookieObj.SelectToken("purchaseLocation.code"));
            Assert.AreEqual(pc.CmsContext.Page.Id, (string)pageJobj.SelectToken("cmsContext.page.id"));

            Assert.IsNull( (string)pageJobj.SelectToken("purchaseLocation.code"));
            Assert.IsNull((string)cookieObj.SelectToken("cmsContext.page.id"));

        }
    }

    

    [Category("Context")]
    [TestFixture]
    public class SiteBuilderApiContextTests
    {

        [Test]
        [TestCase("/foo/bar?a=b", "/foo/bar?a=b&__api__ctx=123",TestName = "Can_append_sitecontext_with_existing_qs")]
        [TestCase("/foo/bar", "/foo/bar?__api__ctx=123",TestName = "Can_append_sitecontext_without_existing_qs")]
        public void SiteBuilderApiContext_AppendSiteContextToRedirect_WithQS(string uri, string expected)
        {
            Assert.AreEqual(expected, SiteBuilderApiContextBuilder.AppendSiteContextToRedirect(uri, new Site(){Id=123}));
        }

        [Test]
        public void SiteBuilderApiContext_Can_Init_With_Token_Placeholders()
        {
            
            Mozu.Core.Logging.LoggingService.LoggerFactory = new LoggerFactory();
            var cookieProvider = Substitute.For<ICookieProvider>();
            var settings = Substitute.For<ISettings>();
            var authenticationHelper = Substitute.For<IAuthenticationHelper>();
            var env = Substitute.For<IWebHostEnvironment>();
            var ctx = new DefaultHttpContext();
            ctx.Request.Method = "GET";
            ctx.Request.Host = new HostString("foo.com");
            ctx.Request.Path = "/bing";
            ctx.Request.Scheme = "http";

            var editModeGetter = Substitute.For<IEditModeFinderOuter>();
            var dvmGetter = Substitute.For<IDataViewModeFinderOuter>();
            ctx.Request.Headers.Add("x-vol-tenant", "123");
            ctx.Request.Headers.Add("x-vol-app-claims", "__mzrpt__");
            ctx.Request.Headers.Add("x-vol-user-claims", "__mzrpt__");


            //var ct = new SiteBuilderApiContextBuilder(ctx, new JwtService(), cookieProvider, settings, authenticationHelper, dvmGetter, editModeGetter).BuildApiContext( new SiteBuilderApiContext(), ctx);
            //Assert.AreEqual(ct.TenantId, 123);
        }
                               
        [Test]
        public void Can_Set_Now_override_In_Staging_Via_QS()
        {
            var cookieProvider = Substitute.For<ICookieProvider>();
            var env = Substitute.For<IWebHostEnvironment>();
            var auth = Substitute.For<IAuthenticationHelper>();

            var settings = Substitute.For<ISettings>();
            settings.AppSettings(Arg.Is("ReverseProxy")).Returns("true");

            var dvm = Substitute.For<IDataViewModeFinderOuter>();
            dvm.GetDataViewMode(Arg.Any<Mozu.Core.LightweightUserClaims>()).Returns(Core.DataViewModeType.Pending);

            var edit = Substitute.For<IEditModeFinderOuter>();
            edit.IsEditMode().Returns(false);

            var hctx = new DefaultHttpContext();
            hctx.Request.Host = new HostString("foo.com");
            hctx.Request.QueryString = new QueryString("?mz_now=2012-11-10");
            //var ctx = new SiteBuilderApiContextBuilder(hctx, new JwtService(), cookieProvider, settings, auth, dvm, edit).BuildApiContext(new SiteBuilderApiContext(), hctx);
            
            //var now = ctx.PreviewDate.Value;

            //Assert.AreEqual(now.Year, 2012);
            //Assert.AreEqual(now.Month, 11);
            //Assert.AreEqual(now.Day, 10);
        }
        [Test]
        public void Can_Set_Now_override_In_Live_Via_QS()
        {
            var cookieProvider = Substitute.For<ICookieProvider>();
            var env = Substitute.For<IWebHostEnvironment>();
            var auth = Substitute.For<IAuthenticationHelper>();

            var settings = Substitute.For<ISettings>();
            settings.AppSettings(Arg.Is<string>("ReverseProxy")).Returns("true");

            var dvm = Substitute.For<IDataViewModeFinderOuter>();
            dvm.GetDataViewMode(Arg.Any<Mozu.Core.LightweightUserClaims>()).Returns(Core.DataViewModeType.Live);

            var edit = Substitute.For<IEditModeFinderOuter>();
            edit.IsEditMode().Returns(false);

            var hctx = new DefaultHttpContext();
            hctx.Request.Host = new HostString("foo.com");
            hctx.Request.QueryString = new QueryString("?mz_now=2012-11-10");

            
            //var ctx = new SiteBuilderApiContextBuilder(hctx, new JwtService(), cookieProvider, settings, auth, dvm, edit).BuildApiContext(new SiteBuilderApiContext(), hctx);

            //Assert.IsNull(ctx.PreviewDate);
        }
    }
}
