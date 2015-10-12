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

    public class RedirectHandlerTests
    {

        [TestCaseSource("GetTests")]
        public async Task DefaultTests(TestScenario test)
        {
            var uri = new Uri("http://localhost/" + test.Url);
            var repo = Substitute.For<IRedirectRepository>();
            repo.GetRuntimeRedirectEntries(Arg.Any<int?>()).Returns(ctx => Task.FromResult(test.RuntimeRedirects));

            var res = await RedirectHandler.Instance.GetRedirectForRequestUri(repo, uri);
            if (res == null && test.Result == null)
            {
                return;
            }
            if (res == null && test.Result != null || test.Result == null && res != null)
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
                                    Priority = 0,
                                    IsEnabled = true
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
        public IEnumerable<TestScenario> GetTests()
        {
            yield return
                new TestScenario()
                {
                    Name = "prefixedQsMatch",
                    Url = "/?foo=5&moo=6",
                    RuntimeRedirects = GetDefaultRedirects(),
                    Result = new RedirectEntry
                    {
                        Destination = "/products-category/c/282?foo=h5&moo=6"
                    }
                };

            yield return new TestScenario()
            {
                Name = "simple substitution",
                Url = "/foo?prods=123456",
                RuntimeRedirects = new RuntimeRedirects
                {
                    QueryString = new Dictionary<string, List<RuntimeRedirectEntry>>
                    {
                        {
                            "foo", new List<RuntimeRedirectEntry>
                            {
                                new RuntimeRedirectEntry
                                {
                                    Query = System.Web.HttpUtility.ParseQueryString("prods=*"),
                                    Redirect = new RedirectEntry
                                    {
                                        Source = "foo?prods=*",
                                        Destination = "p/{prods}",
                                        IsEnabled = true
                                    }
                                }
                            }
                        }
                    }
                },
                Result = new RedirectEntry
                {
                    Destination = "p/123456"
                }
            };
            yield return new TestScenario()
            {
                Name = "redirect with QS in destination",
                Url = "test?prod=MS-TEST-007&utm_campaign=test",
                RuntimeRedirects = new RuntimeRedirects
                {
                    QueryString = new Dictionary<string, List<RuntimeRedirectEntry>>
                    {
                        {
                            "test",
                            new List<RuntimeRedirectEntry>
                            {
                                new RuntimeRedirectEntry
                                {
                                    Query = System.Web.HttpUtility.ParseQueryString("prod=*&utm_campaign=*"),
                                    Redirect = new RedirectEntry
                                    {
                                        Source = "test?prod=*&utm_campaign=*",
                                        Destination = "p/{prod}?campaign={utm_campaign}"
                                    }
                                }
                            }
                        }
                    }
                },
                Result = new RedirectEntry
                {
                    Destination = "p/MS-TEST-007?campaign=test"
                }
            };
        }

        public class TestScenario
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
