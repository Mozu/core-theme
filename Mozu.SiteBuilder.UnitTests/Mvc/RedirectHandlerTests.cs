using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.MessageHandler;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.UX.Models.Navigation;
using NUnit.Framework;
using System.Net.Http;
using NSubstitute;

namespace Mozu.SiteBuilder.UnitTests.Mvc
{


    [Category("Redirects")]
    [TestFixture]

    class RedirectHandlerTests
    {

       

        [TestCaseSource("GetTests")]
        public async Task DefaultTests(TestSenario test)
        {
            var uri = new Uri("http://localhost/" + test.Url);
            var repo = Substitute.For<IRedirectRepository>();
            repo.GetRuntimeRedirectEntries(Arg.Any<int?>()).Returns(ctx => Task.FromResult(test.RuntimeRedirects));

            var res = await RedirectHandler.Instance.GetRedirectForRequestUri(repo, uri);
            if (res == null && test.Result == null)
            {
                return;
            }
            if ( res == null && test.Result != null || test.Result == null && res != null)
            {
                Assert.AreNotEqual(res, test.Result);
                return;
            }
            Assert.AreEqual(test.Result.Destination, res.Destination);
        }

        public RuntimeRedirects GetDefaultRedirects()
        {
            return new RuntimeRedirects()
            {
                QueryString = new Dictionary<string, List<RuntimeRedirectEntry>>(StringComparer.OrdinalIgnoreCase)
                {
                    {"1", new List<RuntimeRedirectEntry>()
                        {
                            new RuntimeRedirectEntry()
                            {
                                Redirect= new RedirectEntry()
                                {
                                    Destination = "/products-category/c/282?foo=h{foo}&moo={moo}",
                                    CopyQueryString = true,
                                    Source="1",
                                    Priority = 0
                                },
                                Query= System.Web.HttpUtility.ParseQueryString("foo=5&moo=*")

                            }
                        }
                    }
                },
                Simple = new Dictionary<string, RedirectEntry>(StringComparer.OrdinalIgnoreCase)
                {

                }
            };
        }
        public IEnumerable<TestSenario> GetTests()
        {
            var list = new List<TestSenario>() {
             new TestSenario()
                {
                    Name = "prefixedQsMatch",
                    Url = "/?foo=5&moo=6",
                    RuntimeRedirects = GetDefaultRedirects(),
                    Result = new RedirectEntry
                    {
                        Destination = "/products-category/c/282?foo=h5&moo=6"
                    }
                },
             new TestSenario()
             {
                 Name="simple substitution",
                 Url = "/foo?prods=123456",
                 RuntimeRedirects = new RuntimeRedirects
                 {
                     QueryString = new Dictionary<string, List<RuntimeRedirectEntry>>
                     {
                         {
                             "foo", new List<RuntimeRedirectEntry> {
                             new RuntimeRedirectEntry {
                                 Query = System.Web.HttpUtility.ParseQueryString("prods=*"),
                                 Redirect = new RedirectEntry {
                                    Source = "foo?prods=*",
                                    Destination = "p/{prods}"
                                 }
                                }
                             }
                         }
                     }
                 },
                 Result = new RedirectEntry
                 {
                     Destination = "p/123456"
                 } } };
            return list;
        }

        public class TestSenario
        {
            public string Name { get; set; }
            public string Url { get; set; }
           
            public RedirectEntry Result { get; set; }
            public RuntimeRedirects RuntimeRedirects { get; set; }
            public override string ToString()
            {
                return Name;
            }
        }
    }
}
