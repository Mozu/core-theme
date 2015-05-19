using System;
using System.Collections.Generic;
using NUnit.Framework;
using Mozu.SiteBuilder.Mvc.Tags;
using Newtonsoft.Json;
using Mozu.SiteBuilder.Mvc;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UnitTests.Mvc.Filters
{
    [Category("Hypr")]
    [TestFixture]
    public class HyprDumpTagTests : TemplateTestBase
    {
        [Test, TestCaseSource("GetTests")]
        public void Run(TestDescriptor desc)
        {
            RunTemplate(desc);
        }

        //private Order order = new Order { CustomerAccountId = null, DiscountedTotal = 13};

        private static List<TestDescriptor> GetTests()
        {
            int? nullVar = null;
            var nullModel = new {siteId = 4, someProp = nullVar};
            var model = new {siteId = 4, someProp = "I am property"};


            return new List<TestDescriptor>
            {
                new TestDescriptor
                {
                    Name = "Dump Tag without null values",
                    Template = @"{% dump model %}",
                    ExpectedFunc = (actual) => GetDumpJson(JObject.FromObject(model), actual),
                    Context = new Dictionary<string, object> { {"model", model }}
                },
                new TestDescriptor
                {
                    Name = "Dump Tag with null values",
                    Template = @"{% dump model %}",
                    ExpectedFunc = (actual) => GetDumpJson(JObject.FromObject(nullModel), actual),
                    Context = new Dictionary<string, object> { {"model", nullModel }}
                }
            };
        }

        static Tuple<bool, string> GetDumpJson(JObject model, string html)
        {
            var properties = html.Split(new String[] { "\r\n", "\n" }, StringSplitOptions.None);
            var json = JObject.Parse(properties[1].Replace("</pre>", ""));

            foreach (var x in model)
            {

                if (!x.Value.Equals(json[x.Key]))
                {
                    return new Tuple<bool, string>(false, String.Format("Model {0}, is not what is expected {1}", model, html));
                }
            }

            return new Tuple<bool, string>(true, "");
        }
    }


}
