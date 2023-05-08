using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Contexts;
using NSubstitute;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.Mvc.Context
{
    [TestFixture]
    public class SIteContextTests
    {
        [Test]
        public void TestFindThemeValue()
        {
            string inputString = "t29594-s48733-thm456-567.stg1.mozu.com";
            string expectedOutput = "~456~567";
            string actualOutput = SiteContext.FindThemeValue(inputString);
            Assert.AreEqual(expectedOutput, actualOutput);
        }
        
        [Test]
        public void TestFindThemeValue3()
        {
            string inputString = "t29594-s48733.stg1.mozu.com";
            string expectedOutput = "~567~567";
          
            var httpContext = new DefaultHttpContext();
            var cookies = Substitute.For<ICookieProvider>();
            httpContext.Request.Query = new QueryCollection(new Dictionary<string, StringValues>(StringComparer.OrdinalIgnoreCase){{"theme", expectedOutput}});

            string actualOutput = SiteContext.ProcessThemeOverride("t29594-s48733.stg1.mozu.com", httpContext, cookies);
            
            
            Assert.AreEqual(expectedOutput, actualOutput);
        }
        
        
    }
}
  

