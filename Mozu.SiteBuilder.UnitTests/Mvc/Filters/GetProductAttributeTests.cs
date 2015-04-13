using System;
using System.Collections.Generic;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.Mvc.Filters
{
    [Category("Hypr")]
    [TestFixture]
    public class GetProductAttributeTests : TemplateTestBase
    {
        [Test, TestCaseSource("GetTests")]
        public void Run(TestDescriptor desc)
        {
            RunTemplate(desc);
        }

        private const string getavailability = "{{ product | get_product_attribute('availability') }}";

        private static List<TestDescriptor> GetTests()
        {

            return new List<TestDescriptor>
            {
                new TestDescriptor
                {
                    Name = "base case",
                    Template = getavailability,
                    Context = new Dictionary<string, object> { { "product", new {Properties = new[] { new { attributeFQN = "availability", value = "test" } } }}},
                    Expected = "{ attributeFQN = availability, value = test }"
                },
                new TestDescriptor
                {
                    Name = "no product",
                    Template = getavailability,
                    Context = new Dictionary<string, object> { {"product", null} },
                    Expected = String.Empty
                },
                new TestDescriptor
                {
                    Name = "no matching property",
                    Template = getavailability,
                    Context = new Dictionary<string, object> { { "product", new{Properties = new object[]{}}} },
                    Expected = String.Empty
                },
                new TestDescriptor
                {
                    Name = "will match options as well",
                    Template = getavailability,
                    Context = new Dictionary<string, object> { {"product", new{Options = new[]{new {attributeFQN = "availability", value = "test"}}}} },
                    Expected = "{ attributeFQN = availability, value = test }"
                },
                new TestDescriptor {
                    Name = "matches property value case insensitvely",
                    Template = getavailability.Replace("availability", "Availability"),
                    Context = new Dictionary<string, object> { { "product", new {Properties = new[] { new { attributeFQN = "availability", value = "test" } } }}},
                    Expected = "{ attributeFQN = availability, value = test }"
                }
            };
        }
    }
}
