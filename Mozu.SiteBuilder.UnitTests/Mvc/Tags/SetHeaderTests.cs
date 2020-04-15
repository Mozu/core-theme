using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using NUnit.Framework;
using Autofac;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using NSubstitute;
using UrlHelper = Mozu.SiteBuilder.Mvc.Helpers.UrlHelper;
using System.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.UnitTests.Mvc.Tags
{
    [Category("Hypr")]
    [Category("MakeUrl")]
    [TestFixture]
    public class SetHeaderTests : TemplateTestBase
    {
        [Test, TestCaseSource("GetTests")]
        public void SetHeader(TestDescriptor desc)
        {
            RunTemplate(desc);
        }

        private static List<TestDescriptor> GetTests()
        {
            Action<IServiceCollection> containerMods = cb =>
            {
                var hcb = Substitute.For<HttpContext>();
                var resp = Substitute.For<HttpResponse>();
                hcb.Response.Returns(resp);
                var headers = new HeaderDictionary
                {
                    { "a", "c" }
                };
                resp.Headers.Returns(headers);

                cb.AddScoped(c => hcb);
            };

            return new List<TestDescriptor>
            {
                new TestDescriptor
                {
                    Name = "custom valueonly w replace ",
                    Template = @"{% set_header ""a:b"" %}",
                    ContainerModifier = containerMods,
                    ExpectedFunc = TestDescriptor.CompareLiteral(""),
                    AssertFn = (s,d)=>{
                        var httpContext = (d.Context["_vc"] as HyprViewContext).HttpContext;
                        httpContext.Response.Received().Headers.Add("a","b");

                        Assert.AreEqual(httpContext.Response.Headers["a"] ,null);
                    }
                },
                 new TestDescriptor
                {
                    Name = "custom valueonly no replace ",
                    Template = @"{% set_header ""a:b"" replace=false %}",
                    ContainerModifier = containerMods,
                    ExpectedFunc = TestDescriptor.CompareLiteral(""),
                    AssertFn = (s,d)=>{
                        var httpContext = (d.Context["_vc"] as HyprViewContext).HttpContext;
                        httpContext.Response.Received().Headers.Add("a","b");

                        Assert.AreEqual(httpContext.Response.Headers["a"] ,"c");
                    }
                },

                 new TestDescriptor
                {
                    Name = "custom kvp w replace ",
                    Template = @"{% set_header name=""a"" value=""b"" %}",
                    ContainerModifier = containerMods,
                    ExpectedFunc = TestDescriptor.CompareLiteral(""),
                    AssertFn = (s,d)=>{
                        var httpContext = (d.Context["_vc"] as HyprViewContext).HttpContext;
                        httpContext.Response.Received().Headers.Add("a","b");

                        Assert.AreEqual(httpContext.Response.Headers["a"] ,null);
                    }
                },

            };
        }

    }
}
