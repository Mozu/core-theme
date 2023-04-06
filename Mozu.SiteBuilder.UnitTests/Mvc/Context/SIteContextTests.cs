using Mozu.SiteBuilder.Mvc.Contexts;
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
    }
}
  

