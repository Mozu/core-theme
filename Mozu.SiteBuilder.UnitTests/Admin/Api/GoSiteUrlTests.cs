using Mozu.SiteBuilder.UX.Areas.Misc.Controllers;
using NUnit.Framework;
using Should;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UnitTests.Admin.Api
{
    [TestFixture, Category("gosite")]
    public class GoSiteUrlTests
    {
        [TestCaseSource("tests")]
        public void UriGetsCreatedAsExpected(string input, string newhostname, bool dohostnameredirect, string expected)
        {
            TestingController.CreateRedirectUrl(input, newhostname, dohostnameredirect).ToString().ShouldEqual(expected, StringComparer.OrdinalIgnoreCase);
        }

        private static IEnumerable<object[]> tests()
        {
            yield return new object[] { "/test/foo?lol=true", "laughs.com", true, "http://laughs.com/test/foo?lol=true" };
            yield return new object[] { "/test/foo?lol=true", "laughs.com", false, "~/test/foo?lol=true" };
            yield return new object[] { "http://whutwhut.com/test/foo?lol=true", "laughs.com", true, "http://laughs.com/test/foo?lol=true" };
            yield return new object[] { "https://whutwhut.com/test/foo?lol=true", "laughs.com", true, "https://laughs.com/test/foo?lol=true" };
            yield return new object[] { "https://whutwhut.com/test/foo?lol=true", "laughs.com", false, "https://laughs.com/test/foo?lol=true" };
            yield return new object[] { null, "laughs.com", true, "http://laughs.com" };
            yield return new object[] { null, "laughs.com", false, "~/" };
            yield return new object[] { "foo/bar", "laughs.com", false, "~/foo/bar" };
        }
    }
}
