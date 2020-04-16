using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
//using Mozu.SiteBuilder.Mvc.MessageHandler;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.UX.Models.Navigation;
using NUnit.Framework;
using System.Net.Http;
using NSubstitute;
//using AutofacContrib.NSubstitute;
using Mozu.Content.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.Core.Logging;

namespace Mozu.SiteBuilder.UnitTests.Mvc
{
    [Category("Redirects")]
    [TestFixture]

    public class RedirectHandlerTests
    {

        [TestCaseSource("GetTests")]
        public async Task RedirectHandlerTestsExec(TestScenario test)
        {
            var uri = new Uri("http://localhost/" + test.Url);
            var repo = Substitute.For<IRedirectRepository>();
            repo.GetRuntimeRedirectEntries(Arg.Any<int?>()).Returns(ctx => test.RuntimeRedirects);

            var res =  RedirectHandler.Instance.GetRedirectForRequestUri(repo, uri);
            if (res == null && test.Result == null)
            {
                return;
            }
            if (res == null && test.Result != null || test.Result == null && res != null)
            {
                Assert.Fail();
                return;
            }

            Assert.AreEqual(test.Result.Destination, res.Destination);
        }

        public static RuntimeRedirects GetDefaultRedirects()
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
                                    Destination = "/products-category/c/282?foo2=h{foo}&moo={moo}",
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

                },
                WildCards = new List<Tuple<int, Dictionary<string, List<RuntimeRedirectEntry>>>>()
            };
        }
        public static RuntimeRedirects GetWildCardRedirects()
        {

            //IDocumentListWebApiClient documentListWebApiClient, ISiteBuilderApiContext siteBuilderApiContext, ILogger logger
            //var repo = new RedirectRepository(Substitute.For<IDocumentListWebApiClient>(),
            //    Substitute.For<ISiteBuilderApiContext>(),
            //    Substitute.For<ILogger>());


            var rawList = new List<RedirectEntry>()
            {
                
                new RedirectEntry()
                {
                    Destination="abcd/*/efg",
                    IsEnabled = true,
                    Source = "abcd/*/efg"
                },
                new RedirectEntry()
                {
                    Destination="abcd/*/efg?hij=*",
                    IsEnabled = true,
                    Source = "abcd/*/efg?hij=*"
                },
                new RedirectEntry()
                {
                    Destination="abcd/*",
                    IsEnabled = true,
                    Priority = -1,
                    Source = "abcd/*"
                },
                new RedirectEntry()
                {
                    Destination="hij-*-lmno-*p",
                    IsEnabled = true,
                    Source = "hij-*-lmno-*p"
                }
                ,new RedirectEntry()
                {
                    Destination="1*2*3",
                    IsEnabled = true,
                    Source = "1*2*3"
                } ,
                new RedirectEntry()
                {
                    Destination="*stuff*",
                    IsEnabled = true,
                    Source = "*stuff*"
                },new RedirectEntry()
                {
                    Destination="*bratwurst*good",
                    IsEnabled = true,
                    Source = "*bratwurst*good"
                }
                ,new RedirectEntry()
                {
                    Destination="{bing}/product/{bing}",
                    IsEnabled = true,
                    Source = "phipps?bing=*"
                }
                

            };

            rawList.Sort(RedirectComparer.Default);

            return RedirectRepository.BuildRuntimeRedirects(rawList);
        }
        public static IEnumerable<TestScenario> GetTests()
        {
            yield return
                new TestScenario()
                {
                    Name = "wildcard1",
                    Url = "/abcd/food-is-good/food",
                    RuntimeRedirects = GetWildCardRedirects(),
                    Result = new RedirectEntry
                    {
                        Destination = "abcd/*"
                    }
                };
            yield return
                new TestScenario()
                {
                    Name = "wildcard2",
                    Url = "/aBcD/food-is-good/eFg",
                    RuntimeRedirects = GetWildCardRedirects(),
                    Result = new RedirectEntry
                    {
                        Destination = "abcd/*/efg"
                    }
                };
            yield return
                new TestScenario()
                {
                    Name = "wildcard3",
                    Url = "/abc",
                    RuntimeRedirects = GetWildCardRedirects(),

                };
            yield return
            new TestScenario()
            {
                Name = "wildcard4",
                Url = "/abcd/food-is-good/efg?hij=123",
                RuntimeRedirects = GetWildCardRedirects(),
                Result = new RedirectEntry
                {
                    Destination = "abcd/*/efg?hij=*"
                }
            };
            yield return new TestScenario()
            {
                Name = "wildcard5",
                Url = "/123",
                RuntimeRedirects = GetWildCardRedirects(),
                Result = new RedirectEntry
                {
                    Destination = "1*2*3"
                }
            };
            yield return
            new TestScenario()
            {
                Name = "wildcard6",
                Url = "/132",
                RuntimeRedirects = GetWildCardRedirects(),

            };

            yield return
            new TestScenario()
            {
                Name = "wildcard7",
                Url = "/asdf/asdf/adsf/bratwurst-issooo-good",
                RuntimeRedirects = GetWildCardRedirects(),
                Result = new RedirectEntry()
                {
                    Destination= "*bratwurst*good"
                }

            };
            yield return new TestScenario()
          {
              Name = "querystring wildcard mapped",
              Url = "/phipps?bing=123",
              RuntimeRedirects = GetWildCardRedirects(),
              Result = new RedirectEntry()
              {
                  Destination = "123/product/123"
              }

          };

            yield return
                new TestScenario()
                {
                    Name = "prefixedQsMatch",
                    Url = "1?foo=5&moo=6",
                    RuntimeRedirects = GetDefaultRedirects(),
                    Result = new RedirectEntry
                    {
                        Destination = "/products-category/c/282?foo2=h5&moo=6&foo=5"
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
