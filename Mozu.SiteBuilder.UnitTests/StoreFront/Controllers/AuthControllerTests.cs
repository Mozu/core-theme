using Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers;
using NUnit.Framework;
using System;
using NSubstitute;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Mozu.Core.Api.ErrorHandler;
using Mozu.Core.Test;

namespace Mozu.SiteBuilder.UnitTests.StoreFront.Controllers
{
    [TestFixture]
    [Category("AuthControllerTests")]
    public class AuthControllerTests
    {
        [Test]
        public void CannotCreateAccountWithInvalidFistName()
        {
            var errorGenerator = Substitute.For<IErrorResultConverterCollection>();
            var autoSubstitute = new AutoSubstitute(cb =>
            {
                cb.AddScoped<AuthController>();
                var hc = Substitute.For<HttpContext>();
                cb.AddScoped(_ => hc);
                //var rm = new HttpRequestMessage();
                //cb.AddScoped(_ => rm);
                cb.AddScoped(_ => errorGenerator);
            });

            var authController = autoSubstitute.Resolve<AuthController>();
            authController.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext()};
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
            catch (Exception ex)
            {
                errorGenerator.Received().ConvertExceptionToError(ex, false);
            }
        }

        [Test]
        public void CanCreateAccountWithValidFistName()
        {
            var errorGenerator = Substitute.For<IErrorResultConverterCollection>();
            var autoSubstitute = new AutoSubstitute(cb =>
            {
                cb.AddScoped<AuthController>();
                var hcb = Substitute.For<HttpContext>();
                cb.AddScoped(_ => hcb);
                //var rm = new HttpRequestMessage();
                //cb.AddScoped(_ => rm);
                cb.AddScoped(_ => errorGenerator);
            });

            var authController = autoSubstitute.Resolve<AuthController>();
            authController.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };
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
            catch (Exception ex)
            {
                errorGenerator.DidNotReceive().ConvertExceptionToError(ex, false);
            }
        }
    }
}
