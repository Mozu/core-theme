using System.Collections.Generic;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.Mvc.Tags
{
    [Category("Hypr")]
    [TestFixture]
    public class RequireScriptTests : TemplateTestBase
    {
        private static List<TestDescriptor> GetTests()
        {
            return new List<TestDescriptor>
            {
                new TestDescriptor
                {
                    Name = "base case",
                    Template = @"{% require_script ""http://test.script.com/{0}""|string_format(siteId) %}",
                    ExpectedFunc = TestDescriptor.CompareLiteral(string.Empty) // empty string because a fetched script gets added to the render context.
                    Context = new Dictionary<string, object> {{"siteId", 10}},
                },
                new TestDescriptor
                {
                    Name = "url has equals",
                    Template = @"{% require_script ""http://test.script.com/id={0}""|string_format(siteId) %}",
                    Context = new Dictionary<string, object> {{"siteId", 10}},
                    ExpectedFunc = TestDescriptor.CompareLiteral(string.Empty) // empty string because a fetched script gets added to the render context.
                },
               
                new TestDescriptor
                {
                    Name = "parent tag loops",
                    Template = @"{% extends ""middle"" %}
                                {%block title-tag-content %}a{% parent %}{% endblock title-tag-content %}",
                    Context = new Dictionary<string, object>(),
                    ExpectedFunc = TestDescriptor.ComapreLiteral("12abc34"),
                    Templates = new Dictionary<string, string>
                    {
                        {
                            "middle",
                            @"{% extends ""top"" %}
                              {%block title-tag-content %}b{% parent %}{% endblock title-tag-content %}"
                        },
                        {
                            "top",
                            @"12{%block title-tag-content %}c{% parent %}{% endblock title-tag-content %}34"
                        }
                    }
                },
                 new TestDescriptor
                {
                    Name = "extend ",
                    Template = @"{% extends ""middle"" %}
                                {%block a %}bottom a{% endblock a %}",
                    Context = new Dictionary<string, object>(),
                    Expected = "bottom amiddle btop c",
                    Templates = new Dictionary<string, string>
                    {
                        {
                            "middle",
                            @"{% extends ""top"" %}
                              {% block b %}middle b{% endblock b %}"
                        },
                        {
                            "top",
                            @"{%block a %}top a{% endblock a %}{% block b %}top b{% endblock b %}{%block c %}top c{% endblock c %}"
                        }
                    }
                },

//                new TestDescriptor
//                {
//                    Name = "extend loop",
                  
//                    Template = @"{% extends ""middle"" %}
//                                {%block a %}bottom a{% endblock a %}",
//                    Context = new Dictionary<string, object>(),
//                    Expected = "bottom amiddle btop c",
//                    Templates = new Dictionary<string, string>
//                    {
//                        {
//                            "middle",
//                            @"{% extends ""top"" %}
//                              {% block b %}middle b{% endblock b %}"
//                        },
//                        {
//                            "top",
//                            @"{% extends ""middle"" %}
//                                {%block a %}top a{% endblock a %}{% block b %}top b{% endblock b %}{%block c %}top c{% endblock c %}"
//                        }
//                    }
//                }
            };
        }

        [Test, TestCaseSource("GetTests")]
        public void Run(TestDescriptor desc)
        {
            RunTemplate(desc);
        }
    }
}