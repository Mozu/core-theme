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
            yield return new object[] { "foo/bar?t=%2f", "laughs.com", false, "~/foo/bar?t=%2f" };
            yield return new object[] { "/foo/bar?t=%2fblah%2b", "laughs.com", true, "http://laughs.com/foo/bar?t=%2fblah%2b" };
            //yield return new object[] { "%2fback-office%2forders%2f07427f37157c2821b82431570000179a%3ft%3dNx9lavdBfmLnQCcE1PNGt8252PD7fZavoEFZkDycZODTzwTSeQ3cPoODggStSpQEM6PIH3KQFcMJsj6XGZu0NfdDo3c3EGOeiUpbX3wW4p%252fmC3OGqDBRo4DyzHAN1IhAun2DetuVPpivDcIl%252buWlNMNRG4vDqVl%252fYSCO84AjTR09cvyFCHh7vhPfJpSJupy%252b5gqsxi9JTO%252ba4W2u8sqjUfPloDeEcqrqo1nYHuVMXEMe510IMbk09F3BkcbpHqapzeu0I3C%252bSfyJD2kGvH1b%252bg%253d%253d", "laughs.com", true, "http://laughs.com/back-office/orders/07427f37157c2821b82431570000179a?t=Nx9lavdBfmLnQCcE1PNGt8252PD7fZavoEFZkDycZODTzwTSeQ3cPoODggStSpQEM6PIH3KQFcMJsj6XGZu0NfdDo3c3EGOeiUpbX3wW4p%252fmC3OGqDBRo4DyzHAN1IhAun2DetuVPpivDcIl%252buWlNMNRG4vDqVl%252fYSCO84AjTR09cvyFCHh7vhPfJpSJupy%252b5gqsxi9JTO%252ba4W2u8sqjUfPloDeEcqrqo1nYHuVMXEMe510IMbk09F3BkcbpHqapzeu0I3C%252bSfyJD2kGvH1b%252bg%253d%253d" };
        }
    }
}
