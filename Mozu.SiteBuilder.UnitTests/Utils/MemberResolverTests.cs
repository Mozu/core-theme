using Microsoft.FSharp.Core;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using Should;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UnitTests.Utils
{
    [TestFixture]
    public class MemberResolverTests
    {
        private static readonly JsonCleaningCaseInsensitiveMemberResolver _resolver = new JsonCleaningCaseInsensitiveMemberResolver();

        [TestCaseSource("cases")]
        public void resolve(object input, string member, object expected)
        {
            _resolver.ResolveMember(input, member).ShouldEqual<object>(expected);
        }

        public static IEnumerable<object[]> cases()
        {
            yield return new object[] { new JObject() { { "Property", true } }, "property", FSharpOption<object>.Some(true) };
            //yield return new object[] { Microsoft.ClearScript.Undefined, "meh", FSharpOption<object>.None };
            yield return new object[] { new JObject() { { "isEmpty", new JValue(false) } }, "isEmpty", FSharpOption<object>.Some(false) };
        }
    }
}
