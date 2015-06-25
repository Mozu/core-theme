using Mozu.SiteBuilder.Mvc.Tags;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Should;

namespace Mozu.SiteBuilder.UnitTests.Mvc.Tags
{
    [TestFixture]
    public class ArgumentCollectionTests
    {
        public class Test
        {
            public IEnumerable<TagArgument> Args { get; set; }
            public string argName { get; set; }
            public object Default {get;set;}
            public object expected { get; set; }
        }

        [TestCaseSource("ArgTests")]
        public void TestArgs(Test t)
        {
            var collection = new ArgumentCollection(t.Args);
            collection.GetValueOrDefault(t.argName, t.Default).ShouldEqual(t.expected);
        }

        static IEnumerable<Test> ArgTests()
        {
            yield return new Test
            {
                Args = new List<TagArgument> { new TagArgument { ArgumentType = TagArgument.ArgumentTypes.NamedArgument, Name = "pageSize", TokenValue = "pageSize=99", Value = 99 } },
                argName = "pageSize",
                Default = 15,
                expected = 99
            };
        }


    }
}
