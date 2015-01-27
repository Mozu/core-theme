using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Routing;
using Magnum.Extensions;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Client;
using NUnit.Framework;
using Mozu.SiteBuilder.Mvc.SEO;
using NSubstitute;

namespace Mozu.SiteBuilder.IntegrationTests.Ux.Routing
{
   

    [TestFixture]
    public class SiteRouteTests
    {
        [TestFixtureSetUp]
        public void TestFixtureSetUp()
        {
            
            // _cartWebApiClient = Substitute.For<ICartWebApiClient>();
        }

        [Ignore, Test]
        public void DoStuff()
        {

            //var docSrv = Substitute.For<IDocumentListWebApiClient>();

           // ISiteRouteRepository repo = (ISiteRouteRepository)new SiteRouteRepository(null);
           // var response = Substitute.For<HttpResponseBase>();
           // var req = Substitute.For<HttpRequestBase>();
           
           // req.PathInfo.Returns("");
           // var httpContext = Substitute.For<HttpContextBase>();

           // response.ApplyAppPathModifier(Arg.Any<string>()).Returns(x => x.Arg<string>());
           // httpContext.Request.Returns(req);
           // httpContext.Response.Returns(response);
           // var col = repo.GetRouteCollectoin().Result;
           // req.AppRelativeCurrentExecutionFilePath.Returns("~/bios/steve");
           //// var repo =Substitute.ForPartsOf<SiteRouteRepository>(null);

           // var a=col[0].GetRouteData(httpContext);
           // var b = col[1].GetRouteData(httpContext);
           // var path = col.GetVirtualPath(new RequestContext(httpContext, new RouteData()), new RouteValueDictionary());
           // var data = col.GetRouteData(httpContext);
           



           // req.AppRelativeCurrentExecutionFilePath.Returns("~/stuff_is_good");
           // // var repo =Substitute.ForPartsOf<SiteRouteRepository>(null);
         
           // path = col.GetVirtualPath(new RequestContext(httpContext, new RouteData()), new RouteValueDictionary());
           // data = col.GetRouteData(httpContext);
           // a = col[0].GetRouteData(httpContext);
           // b = col[1].GetRouteData(httpContext);

           // req.AppRelativeCurrentExecutionFilePath.Returns("~/bios");
           // // var repo =Substitute.ForPartsOf<SiteRouteRepository>(null);

           // path = col.GetVirtualPath(new RequestContext(httpContext, new RouteData()), new RouteValueDictionary());
           // data = col.GetRouteData(httpContext);

           // req.AppRelativeCurrentExecutionFilePath.Returns("~/xxx/yyy");
           // // var repo =Substitute.ForPartsOf<SiteRouteRepository>(null);

           // path = col.GetVirtualPath(new RequestContext(httpContext, new RouteData()), new RouteValueDictionary());
           // data = col.GetRouteData(httpContext);
        }
    }
}
//ISiteRouteRepository




