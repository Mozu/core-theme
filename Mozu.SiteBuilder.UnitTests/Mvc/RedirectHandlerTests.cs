using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.MessageHandler;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.UX.Models.Navigation;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.Mvc
{


    [Category("Redirects")]
    [TestFixture]

    class RedirectHandlerTests
    {

       

        [Test, TestCaseSource("GetTests")]
        public void DefaultTests(TestSenario test)
        {
            var uri = new Uri("http://localhost"+ test.Url);

            var res =RedirectHanlder.Instance.FindRedirectForRequestUri(test.RuntimeRedirects, uri);
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
                }
             };
            return list;
                 




        }
        public class TestSenario
        {
            public string Name { get; set; }
            public string Url { get; set; }
           
            public RedirectEntry Result { get; set; }
            public RuntimeRedirects RuntimeRedirects { get; set; }
        }
    }
}
