using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Kibo.Fulfillment.Contracts.Api;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Exceptions;
using Mozu.Core.Expressions;
using Mozu.Core.Settings;
using Mozu.Customer.Contracts.Clients;
using Mozu.Location.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Helpers;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteSettings.Order.Contracts.Clients;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using NSubstitute;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.StoreFront.Controllers
{
    [TestFixture]
    public class EmailControllerTests
    {
     private EmailController _emailController;
      private IOrderWebApiClient _orderWebApiClient;

        [SetUp]
        public void Setup()
        {
            var customerAccountWebApiClient = Substitute.For<ICustomerAccountWebApiClient>();
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
            var pageRuleEvaluator = new Lazy<IExpressionEvaluator>();
            var b2bAccountWebApiClient = Substitute.For<IB2BAccountWebApiClient>();
            
            _emailController = new EmailController(
                customerAccountWebApiClient,
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
                b2bAccountWebApiClient
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
    }
}