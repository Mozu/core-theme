using NUnit.Framework;
using Mozu.SiteBuilder.Mvc.SEO;

namespace Mozu.SiteBuilder.UnitTests.Mvc.SEO
{
    [Category("QueryString")]
    [TestFixture]
    public class SlugRegexTest
    {
        //private static Regex _slugRegex = new Regex(@"[^a-zA-Z0-9\.\-/]"); ///%]|(%\d)

        [TestCase("% invalid", @"/ac-1%39/p/AC-1", @"/ac-19/p/AC-1")]
        [TestCase("% space and .", @"/ac-1%209.p/AC-1", @"/ac-19.p/AC-1")]
        [TestCase("space", @"/ac-1%209/p/AC-1", @"/ac-19/p/AC-1")]
        [TestCase("%%%", @"/ac-1%209/p/AC-1%%%", @"/ac-19/p/AC-1")]
        [TestCase("+", @"/ac-1%209/p/AC-1+", @"/ac-19/p/AC-1")]
        public void When_Given_A_Slug_Then_Should_Strip_Non_AlphaNumeric(string scenario, string url, string expected)
        {
            //arrange
            var sut = new SlugNormalizer();

            //act
            var actual = sut.StripUrl(url);

            //assert
            Assert.That(actual, Is.EqualTo(expected), scenario);
        }

    }
}
