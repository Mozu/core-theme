using Microsoft.FSharp.Core;
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
        [Test]
        public void resolves_insensitively()
        {
            var obj = new JObject()
            {
                {"Property", true }
            };

            var result = new Mozu.SiteBuilder.Mvc.ViewEngine.JsonCleaningCaseInsensitiveMemberResolver().ResolveMember(obj, "property");
            OptionModule.IsSome(result).ShouldBeTrue();
            ((bool)result.Value).ShouldEqual(true);
        }
    }
}
