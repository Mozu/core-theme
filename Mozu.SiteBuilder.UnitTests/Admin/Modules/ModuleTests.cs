using System.Collections.Specialized;
using System.Web;
using System.Web.ModelBinding;
using Magnum.Binding.TypeBinders;
using MongoDB.Bson;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Modules;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NSubstitute;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.Admin.Modules
{

    public class ModuleTests
    {

        HttpContextBase BuildContext(string inVer= null)
        {
            
            var query = new NameValueCollection();
            if (inVer != null)
            {
                query["ver"] = inVer;
            }
            var headers = new NameValueCollection();

            var httpContext = Substitute.For<HttpContextBase>();
            var req = Substitute.For<HttpRequestBase>();
            var res = Substitute.For<HttpResponseBase>();
            var cache = Substitute.For<HttpCachePolicyBase>();
            httpContext.Request.Returns(req);
            httpContext.Response.Returns(res);
       
            res.Cache.Returns(cache);
            req.Headers.Returns(headers);
            req.QueryString.Returns(query);
            return httpContext;
        }

        VersionValidationCacheHeaderModule BuildMod()
        {
            var mod = Substitute.For<VersionValidationCacheHeaderModule>();
            mod.Version.Returns("2");
            mod.CdnOriginHost.Returns("food.com");
            return mod;
        }

        [Test]
        public void ShouldClearCacheHeader()
        {
            var mod = BuildMod();
            var context = BuildContext(inVer: mod.Version+"-not");
          

            mod.ProcessRequest(context);
            context.Response.Cache.Received().SetMaxAge(new TimeSpan(0));
            
        }

        [Test]
        public void ShouldNotClearCacheHeader()
        {
            var mod = BuildMod();
            var context = BuildContext(inVer: mod.Version);
         


            mod.ProcessRequest(context);
            context.Response.Cache.DidNotReceive().SetMaxAge(new TimeSpan(0));

        }


        [Test]
        public void ShouldRedirect()
        {
            var mod = BuildMod();
            var context = BuildContext(inVer: mod.Version + "-not");

            context.Request.Headers["x-vol-orig-url"] = "https://" + mod.CdnOriginHost + "/common/foo.js";
            context.Request.UrlReferrer.Returns(new Uri("https://mozu/stuff"));
            context.Request.Url.Returns(new Uri("http://local/a/b/c"));


            
            mod.ProcessRequest(context);
            context.Response.Received().Redirect("https://mozu/a/b/c");

        }

        [Test]
        public void ShouldNotRedirect()
        {
            var mod = BuildMod();
            var context = BuildContext(inVer: mod.Version + "-not");

            context.Request.Headers["x-vol-orig-url"] = "https://blurf/common/foo.js";
            context.Request.UrlReferrer.Returns(new Uri("https://mozu/stuff"));
            context.Request.Url.Returns(new Uri("http://local/a/b/c"));



            mod.ProcessRequest(context);
            context.Response.DidNotReceive().Redirect("https://mozu/a/b/c");

        }
    }
}
