using Kibo.Fulfillment.Contracts.Api;
using Microsoft.Extensions.Logging;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Exceptions;
using Mozu.Core.Expressions;
using Mozu.Customer.Contracts;
using Mozu.Customer.Contracts.Clients;
using Mozu.Location.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ArcJsExtensions;
using Mozu.SiteBuilder.Mvc.Helpers;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteSettings.Order.Contracts.Clients;
using Mozu.Tenant.Contracts.Clients;
using NSubstitute;
using NUnit.Framework;
using Should;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UnitTests.StoreFront.Controllers
{
    [TestFixture]
    public class EmailControllerTests
    {
        private EmailController _emailController;
        private IOrderWebApiClient _orderWebApiClient;
        private ICustomerAccountWebApiClient _customerAccountWebApiClient;

        private IEmailExtensionContextBuilder _emailExtensionContextBuilder;

        [SetUp]
        public void Setup()
        {
            _customerAccountWebApiClient = Substitute.For<ICustomerAccountWebApiClient>();
            var sitesWebApiClient = Substitute.For<ISitesWebApiClient>();
            var logger = Substitute.For<ILogger<EmailController>>();
            var locationRuntimeWebApiClient = Substitute.For<ILocationRuntimeWebApiClient>();
            var customRouteHandler = Substitute.For<ICustomRouteHandler>();
            _orderWebApiClient = Substitute.For<IOrderWebApiClient>();
            var locationAdminWebApi = Substitute.For<ILocationAdminWebApiClient>();
            var returnSettingsWebApiClient = Substitute.For<IReturnSettingsWebApiClient>();
            var shipmentControllerApiClient = Substitute.For<IShipmentControllerApiClient>();
            var tenantsWebApiClient = Substitute.For<ITenantsWebApiClient>();
            var urlHelper = new Lazy<UrlHelper>();
            var pageRuleVisitor = new Lazy<ExpressionEvaluatorVisitor<CmsPageRuleContext>>();
            var pageRuleEvaluator = new Lazy<IExpressionEvaluator<CmsPageRuleContext>>();
            var b2bAccountWebApiClient = Substitute.For<IB2BAccountWebApiClient>();
            _emailExtensionContextBuilder = Substitute.For<IEmailExtensionContextBuilder>();

            _emailController = new EmailController(
                _customerAccountWebApiClient,
                sitesWebApiClient,
                logger,
                locationRuntimeWebApiClient,
                customRouteHandler,
                _orderWebApiClient,
                locationAdminWebApi,
                returnSettingsWebApiClient,
                shipmentControllerApiClient,
                tenantsWebApiClient,
                urlHelper,
                pageRuleVisitor,
                pageRuleEvaluator,
                b2bAccountWebApiClient,
                _emailExtensionContextBuilder
            );
        }
        [Test]
        public void Test_ThrowsException_When_CheckoutEmailItemsListIsEmpty()
        {
            // Arrange
            var col = new OrderCollection()
            {
                Items = new List<Order>()
            };
            
            var resp = Task.FromResult(new ServiceClientResponse<OrderCollection> { 
                ReadAsAsync = new Func<Task<OrderCollection>>(() => Task.FromResult(col)),
                ReadAsSync = new Func<OrderCollection>(() => col)
            });
            _orderWebApiClient.GetOrders().ReturnsForAnyArgs(resp);
            var json = "{ \"Id\": \"testId\" , \"Items\": []}";
            // Act & Assert
            var ex = Assert.ThrowsAsync<VaeItemNotFoundException>(async () => await _emailController.Convert(json, new EmailTypeInfo { ModelType = typeof(CheckoutEmail) }));

            Assert.IsTrue(ex.Message.Contains("Child Orders Not Found"));
        }
        
        [Test]
        public void Test_Succeeds_When_CheckoutEmailItemsListIsNotEmpty()
        {
            // Arrange
            var col = new OrderCollection()
            {
                Items = new List<Order>()
                {
                    new Order()
                }
            };

            var resp = Task.FromResult(new ServiceClientResponse<OrderCollection> { 
                ReadAsAsync = new Func<Task<OrderCollection>>(() => Task.FromResult(col)),
                ReadAsSync = new Func<OrderCollection>(() => col)
            });
            _orderWebApiClient.GetOrders().ReturnsForAnyArgs(resp);
            var json = "{ \"Id\": \"testId\" , \"Items\": []}";
            // Act & Assert
            Assert.DoesNotThrowAsync(async () => await _emailController.Convert(json, new EmailTypeInfo { ModelType = typeof(CheckoutEmail) }));

        }

        [Test]
        public void Convert_succeeds_for_new_user_email()
        {
            var customerAccount = new CustomerAccount();

            var response = Task.FromResult(new ServiceClientResponse<CustomerAccount>
            {
                ReadAsAsync = new Func<Task<CustomerAccount>>(() => Task.FromResult(customerAccount)),
                ReadAsSync = new Func<CustomerAccount>(() => customerAccount)
            });
            
            _customerAccountWebApiClient.CloneWithoutUserClaims().GetAccount(Arg.Any<int>()).Returns(response);

            var json = "{\"UserEmailAddress\":\"rg1@testmail.com\",\"IsB2BAccount\":true,\"AccountId\":1064}";

            Assert.DoesNotThrowAsync(async () => await _emailController.Convert(json, new EmailTypeInfo { ModelType = typeof(NewUserEmail) }));
        }

        [Test]
        public async Task Convert_assigns_values_to_obj_from_json_new_user()
        {
            var customerAccount = new CustomerAccount();

            var response = Task.FromResult(new ServiceClientResponse<CustomerAccount>
            {
                ReadAsAsync = new Func<Task<CustomerAccount>>(() => Task.FromResult(customerAccount)),
                ReadAsSync = new Func<CustomerAccount>(() => customerAccount)
            });

            _customerAccountWebApiClient.CloneWithoutUserClaims().GetAccount(Arg.Any<int>()).Returns(response);

            var json = "{\"UserEmailAddress\":\"rg1@testmail.com\",\"IsB2BAccount\":true,\"AccountId\":1064}";

            var obj = await _emailController.Convert(json, new EmailTypeInfo { ModelType = typeof(NewUserEmail) });

            obj.ShouldNotBeNull();
            obj.ShouldBeType<NewUserEmail>();

            var newUserEmail = obj as NewUserEmail;
            newUserEmail.UserEmailAddress.ShouldEqual("rg1@testmail.com");
            newUserEmail.IsB2BAccount.ShouldBeTrue();
            newUserEmail.AccountId.ShouldEqual(1064);
            newUserEmail.Account.ShouldNotBeNull();
        }

        [Test]
        public async Task Convert_assigns_values_to_obj_from_json_customer_email_updated()
        {
            var json = "{\"OccurredUtc\":\"2026-01-29T12:34:56Z\",\"ChangeType\":\"emailUpdated\",\"SupportUrl\":\"https://support.example.com\",\"OldEmailAddress\":\"old@example.com\",\"NewEmailAddress\":\"new@example.com\"}";

            var obj = await _emailController.Convert(json, new EmailTypeInfo { ModelType = typeof(CustomerAccountEmailUpdatedEmail) });

            obj.ShouldNotBeNull();
            obj.ShouldBeType<CustomerAccountEmailUpdatedEmail>();

            var model = obj as CustomerAccountEmailUpdatedEmail;
            model.OccurredUtc.ShouldEqual("2026-01-29T12:34:56Z");
            model.ChangeType.ShouldEqual("emailUpdated");
            model.SupportUrl.ShouldEqual("https://support.example.com");
            model.OldEmailAddress.ShouldEqual("old@example.com");
            model.NewEmailAddress.ShouldEqual("new@example.com");
        }

        [Test]
        public async Task Convert_assigns_values_to_obj_from_json_customer_password_updated()
        {
            var json = "{\"OccurredUtc\":\"2026-01-29T12:34:56Z\",\"ChangeType\":\"passwordUpdated\",\"SupportUrl\":\"https://support.example.com\"}";

            var obj = await _emailController.Convert(json, new EmailTypeInfo { ModelType = typeof(CustomerAccountPasswordUpdatedEmail) });

            obj.ShouldNotBeNull();
            obj.ShouldBeType<CustomerAccountPasswordUpdatedEmail>();

            var model = obj as CustomerAccountPasswordUpdatedEmail;
            model.OccurredUtc.ShouldEqual("2026-01-29T12:34:56Z");
            model.ChangeType.ShouldEqual("passwordUpdated");
            model.SupportUrl.ShouldEqual("https://support.example.com");
        }
    }
}