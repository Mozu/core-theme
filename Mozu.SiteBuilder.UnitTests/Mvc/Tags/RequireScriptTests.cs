using NUnit.Framework;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.UnitTests.Mvc.Tags
{
    [TestFixture]

    public class RequireScriptTests : TemplateTestBase
    {
        [Test, TestCaseSource("GetTests")]
        public void Run(TestDescriptor desc)
        {
            RunTemplate(desc);
        }

        private static List<TestDescriptor> GetTests()
        {
            return new List<TestDescriptor>
            {
                new TestDescriptor
                {
                    Name = "base case",
                    Template = @"{% require_script ""http://test.script.com/{0}""|string_format(siteId) %}",
                    Context = new Dictionary<string, object> { { "siteId", 10} }, 
                    Expected = "" // empty string because a fetched script gets added to the render context.
                },
                new TestDescriptor
                {
                    Name = "url has equals",
                    Template = @"{% require_script ""http://test.script.com/id={0}""|string_format(siteId) %}",
                    Context = new Dictionary<string, object> { { "siteId", 10} }, 
                    Expected = "" // empty string because a fetched script gets added to the render context.
                },
            };
        }
    }
}
