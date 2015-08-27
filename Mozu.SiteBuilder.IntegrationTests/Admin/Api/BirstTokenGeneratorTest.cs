using System.Linq;
using System.Threading.Tasks;
using Mozu.Core;
using Mozu.Core.Exceptions;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.UX.Admin.Api;
using NUnit.Framework;
using NSubstitute;

namespace Mozu.SiteBuilder.IntegrationTests.Admin.Api
{
    [TestFixture]
    public class BirstTokenGeneratorTest
    {
        private const string TOKEN_KEY = "BirstTokenGeneratorUrl";
        private const string SSO_KEY = "BirstSsoUrl";
        private const string USER_KEY = "BirstUserName";
        private const string SPACE_ID_KEY = "BirstSpaceId";
        private const string SSO_PASSWORD_KEY = "BirstSsoPassword";

        [Ignore, TestCase("happy path case", 9581)]
        public async Task It_Should_Return_Token_When_Calling_Birst_Token_Generator(string scenario, int tenantId)
        {
            //arrange
            var settings = Substitute.For<ISettings>();
            settings.AppSettings(TOKEN_KEY).Returns("http://aus02ndbrst01.dev.volusion.com/TokenGenerator.aspx");
            settings.AppSettings(SSO_KEY).Returns("http://aus02ndbrst01.dev.volusion.com/SSO.aspx");
            settings.AppSettings(USER_KEY).Returns("mozu_tenant_reporting@volusion.com");
            settings.AppSettings(SPACE_ID_KEY).Returns("a6c9552c-46d6-45fa-84c7-dfc9489c0997");
            settings.AppSettings(SSO_PASSWORD_KEY).Returns("fUERArw28wlRR34Frr7x0jGk0sEJcRe3");

            var apiContext = SubstituteApiContext(tenantId);
            var sut = new BirstTokenGenerator(apiContext, settings);

            //act
            var actual = await sut.GenerateDashboardUri();

            //assert
            Assert.That(actual, Is.Not.Null, scenario);
        }

        [TestCase("bad URL exception test", 10)]
        public void It_Should_Throw_Unexpected_Exception_When_Given_An_Invalid_Url(string scenario, int tenantId)
        {
            //arrange
            var settings = Substitute.For<ISettings>();
            settings.AppSettings(TOKEN_KEY).Returns("http://thisIsAnInvalidUrlForTestingOnly.mozu.com/");
            settings.AppSettings(SSO_KEY).Returns("3234234");
            settings.AppSettings(USER_KEY).Returns("testy");
            settings.AppSettings(SPACE_ID_KEY).Returns("3234234");
            settings.AppSettings(SSO_PASSWORD_KEY).Returns("3234234");
            var apiContext = SubstituteApiContext(tenantId);
            var sut = new BirstTokenGenerator(apiContext, settings);

            //act
            Assert.Throws<VaeUnexpectedErrorException>(
                   async () => await sut.GenerateDashboardUri(), scenario);

        }

        private IApiContext SubstituteApiContext(int tenantId)
        {
            var apiContext = Substitute.For<IApiContext>();
            apiContext.TenantId.Returns(tenantId);
            return apiContext;
        }

    }
}
