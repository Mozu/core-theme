using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UnitTests.Mvc.Tags
{
    [Category("Hypr")]
    [Ignore("test is not finished yet")]
    [TestFixture]
    public class IncludeDocumentTagTests : TemplateTestBase
    {
        [Test, TestCaseSource("GetTests")]
        public void Run(TestDescriptor desc)
        {
            RunTemplate(desc);
        }

        private static IEnumerable<TestDescriptor> GetTests()
        {
            yield return new TestDescriptor
            {
                Name = "can parse all params",
                Template = @"{% include_documents ""test"" with viewName=""blah"" pageWithUrl=true sortWithUrl=true startIndex=1 pageSize=20 query=""I am a query"" sortBy=""I am a sort by"" list=""default"" view=""testview"" ids=""1,2,3,4,5"" id=""10"" effectivityDated=true %}",
                Context = new Dictionary<string, object>(),
                Expected = ""
            };
        }
    }
}
