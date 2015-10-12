using System; 
using System.Collections.Generic;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.Mvc.Filters
{
    [Category("Hypr")]
    [TestFixture]
    public class GetProductAttributeValueTests : TemplateTestBase
    {
        [Test, TestCaseSource("GetTests")]
        public void GetProductAttrTest(TestDescriptor desc)
        {
            RunTemplate(desc);
        }

        private const string getavailability = "{{ product | get_product_attribute_value('availability') }}";
        private const string getavailabilitymulti = "{{ product | get_product_attribute_values('availability')|join(', ') }}";

        private static List<TestDescriptor> GetTests()
        {

            return new List<TestDescriptor>
            {
                new TestDescriptor
                {
                    Name = "base case",
                    Template = getavailability,
                    Context = new Dictionary<string, object> { {"product", new {Properties = new[] {new {attributeFQN = "availability", values = new[]{new{value="eh", stringValue="eh"}}, ismultivalue = false}}}} },
                    ExpectedFunc = TestDescriptor.CompareLiteral("eh")
                },
                new TestDescriptor
                {
                    Name = "no product",
                    Template = getavailability,
                    Context = new Dictionary<string, object> { {"product", null} },
                    ExpectedFunc = TestDescriptor.CompareLiteral(string.Empty)
                },
                new TestDescriptor
                {
                    Name = "no matching property",
                    Template = getavailability,
                    Context = new Dictionary<string, object> { { "product", new{Properties = new object[]{}}} },
                    ExpectedFunc = TestDescriptor.CompareLiteral(string.Empty)
                },
                new TestDescriptor
                {
                    Name = "will match options as well",
                    Template = getavailability,
                    Context = new Dictionary<string, object> { {"product", new {Options = new[] {new {attributeFQN = "availability", values = new[]{new{value="eh", stringValue="Eh"}}}}}} },
                    ExpectedFunc = TestDescriptor.CompareLiteral("Eh")
                },
                new TestDescriptor
                {
                    Name = "takes stringvalue first",
                    Template = getavailability,
                    Context = new Dictionary<string, object> { {"product", new {Options = new[] {new {attributeFQN = "availability", values = new[]{new{value="eh", stringValue="Eh"}}}}}} },
                    ExpectedFunc = TestDescriptor.CompareLiteral("Eh")
                },
                new TestDescriptor
                {
                    Name = "takes stringvalue if told to",
                    Template = "{{ product | get_product_attribute_value('availability') }}",
                    Context = new Dictionary<string, object> { {"product", new {Options = new[] {new {attributeFQN = "availability", values = new[]{new{stringvalue="eh"}}}}}} },
                    ExpectedFunc = TestDescriptor.CompareLiteral("eh")
                },
                new TestDescriptor
                {
                    Name = "base case multi",
                    Template = getavailabilitymulti,
                    Context = new Dictionary<string, object> { {"product", new {Properties = new[] {new {attributeFQN = "availability", values = new[]{new{value="eh", stringValue="EH"}, new {value="meh", stringValue="MEH" } }}}}} },
                    ExpectedFunc = TestDescriptor.CompareLiteral("EH, MEH")
                },
                new TestDescriptor
                {
                    Name = "multi value",
                    Template = "{{ product | get_product_attribute_values('availability', true)|join(', ') }}",
                    Context = new Dictionary<string, object> { {"product", new {Properties = new[] {new {attributeFQN = "availability", values = new[]{new{value="eh", stringValue="EH"}, new {value="meh", stringValue="MEH" } }}}}} },
                    ExpectedFunc = TestDescriptor.CompareLiteral("EH, MEH")
                },
            };
        }
    }
}
