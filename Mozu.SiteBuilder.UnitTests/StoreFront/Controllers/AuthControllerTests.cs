using Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Autofac;
using AutofacContrib.NSubstitute;
using NSubstitute;
using System.Web;
using System.Net.Http;
using Mozu.Core.Api;

namespace Mozu.SiteBuilder.UnitTests.StoreFront.Controllers
{
    [TestFixture]
    [Category("AuthControllerTests")]
    public class AuthControllerTests
    {
        [Test]
        public void CannotCreateAccountWithInvalidFistName()
        {
            var errorGenerator = Substitute.For<IHttpErrorResponseGenerator>();
            var autoSubstitute = new AutoSubstitute(cb =>
            {
                cb.RegisterType<AuthController>().AsSelf();
                var hcb = Substitute.For<HttpContextBase>();
                cb.Register(_ => hcb).As<HttpContextBase>();
                var rm = new HttpRequestMessage();
                cb.Register(_ => rm).As<HttpRequestMessage>();
                cb.Register(_ => errorGenerator).As<IHttpErrorResponseGenerator>();
            });

            var authController = autoSubstitute.Resolve<AuthController>();
            authController.Request = new HttpRequestMessage();
            try
            {
                var res = authController.CreateAccount(new Customer.Contracts.CustomerAccountAndAuthInfo()
                {
                    Account = new Customer.Contracts.CustomerAccount()
                    {
                        FirstName = "<a>",
                        LastName = "b",
                        EmailAddress = "a@b.com",
                        UserName = "asdf"

                    }
                }).Result;
            }
            catch { }
            errorGenerator.Received().GenerateErrorResponse(authController.Request, Arg.Any<Exception>());
           
        }

        [Test]
        public void CanCreateAccountWithValidFistName()
        {
            var errorGenerator = Substitute.For<IHttpErrorResponseGenerator>();
            var autoSubstitute = new AutoSubstitute(cb =>
            {
                cb.RegisterType<AuthController>().AsSelf();
                var hcb = Substitute.For<HttpContextBase>();
                cb.Register(_ => hcb).As<HttpContextBase>();
                var rm = new HttpRequestMessage();
                cb.Register(_ => rm).As<HttpRequestMessage>();
                cb.Register(_ => errorGenerator).As<IHttpErrorResponseGenerator>();
            });

            var authController = autoSubstitute.Resolve<AuthController>();
            authController.Request = new HttpRequestMessage();
            try
            {
                var res = authController.CreateAccount(new Customer.Contracts.CustomerAccountAndAuthInfo()
                {
                    Account = new Customer.Contracts.CustomerAccount()
                    {
                        FirstName = "a",
                        LastName = "b",
                        EmailAddress = "a@b.com",
                        UserName = "asdf"

                    }
                }).Result;
            }
            catch { }
            errorGenerator.DidNotReceive().GenerateErrorResponse(authController.Request, Arg.Any<Exception>());

        }
    }
}
