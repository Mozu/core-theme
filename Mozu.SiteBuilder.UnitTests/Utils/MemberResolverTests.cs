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
        static JsonCleaningCaseInsensitiveMemberResolver _resolver = new JsonCleaningCaseInsensitiveMemberResolver();

        [TestCaseSource("cases")]
        public void resolve(object input, string member, object expected)
        {
            _resolver.ResolveMember(input, member).ShouldEqual(expected);
        }

        public static IEnumerable<object[]> cases()
        {
            yield return new object[] { new JObject() { { "Property", true } }, "property", FSharpOption<object>.Some(true) };
            yield return new object[] { Microsoft.ClearScript.Undefined.Value, "meh", FSharpOption<object>.None };
        }
    }
}
