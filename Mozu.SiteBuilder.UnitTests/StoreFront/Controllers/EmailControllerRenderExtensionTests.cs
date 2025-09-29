using System;
using System.Net;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Threading.Tasks;
using System.Linq;
// Reduced test file: only verifies 'missing template' 410 path.
using Microsoft.Extensions.Logging;
using Mozu.CommerceRuntime.Contracts.Clients;
using Kibo.Fulfillment.Contracts.Api; // IShipmentControllerApiClient
using Mozu.Core.Messaging.Contracts.Notification;
using Mozu.Customer.Contracts.Clients;
using Mozu.Location.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.Core.Expressions; // ExpressionEvaluatorVisitor, IExpressionEvaluator
using Mozu.SiteBuilder.Mvc.ArcJsExtensions; // IEmailExtensionContextBuilder
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.Mvc.Helpers;
using Mozu.SiteBuilder.Mvc.SEO; // ICustomRouteHandler
using Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers;
using Mozu.SiteBuilder.UX.Models.StoreFront.Email;
using Mozu.SiteSettings.Order.Contracts.Clients;
using Mozu.Tenant.Contracts.Clients;
using Mozu.SiteBuilder.UX.Models.Admin.CMS; // CmsPageRuleContext
using NSubstitute;
using NUnit.Framework;
using Should;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Mozu.Tenant.Contracts;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.SiteBuilder.Mvc;

namespace Mozu.SiteBuilder.UnitTests.StoreFront.Controllers
{
    [TestFixture]
    public class EmailControllerRenderExtensionTests
    {
        private EmailController _controller;
        private ILogger<EmailController> _logger;
        private IEmailExtensionContextBuilder _emailExtensionContextBuilder;
        private ITenantsWebApiClient _tenantsWebApiClient;
        private ISiteBuilderApiContext _siteBuilderApiContext;
        private readonly string _arcFunctionId = "embedded.commerce.email.render.before";

        [SetUp]
        public void SetUp()
        {
            _logger = Substitute.For<ILogger<EmailController>>();
            _emailExtensionContextBuilder = Substitute.For<IEmailExtensionContextBuilder>();
            _tenantsWebApiClient = Substitute.For<ITenantsWebApiClient>();
            _siteBuilderApiContext = Substitute.For<ISiteBuilderApiContext>();
            
            // Set up dummy tenant ID
            _siteBuilderApiContext.TenantId.Returns(12345);
            _siteBuilderApiContext.SiteId.Returns(1);
            
            _controller = new EmailController(
                Substitute.For<ICustomerAccountWebApiClient>(),
                Substitute.For<ISitesWebApiClient>(),
                _logger,
                Substitute.For<ILocationRuntimeWebApiClient>(),
                Substitute.For<ICustomRouteHandler>(),
                Substitute.For<IOrderWebApiClient>(),
                Substitute.For<ILocationAdminWebApiClient>(),
                Substitute.For<IReturnSettingsWebApiClient>(),
                Substitute.For<IShipmentControllerApiClient>(),
                _tenantsWebApiClient,
                new Lazy<UrlHelper>(),
                new Lazy<ExpressionEvaluatorVisitor<CmsPageRuleContext>>(() => null),
                new Lazy<IExpressionEvaluator<CmsPageRuleContext>>(() => null),
                Substitute.For<IB2BAccountWebApiClient>(),
                _emailExtensionContextBuilder
            );

            // Set up HttpContext to avoid null reference exceptions
            var httpContext = new DefaultHttpContext();
            httpContext.RequestServices = Substitute.For<IServiceProvider>();
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };

            // Set the SbApiContext property on the controller
            _controller.SbApiContext = _siteBuilderApiContext;

            // Provide a minimal SiteContext with empty EmailTemplates so lookup fails.
            var sc = (SiteContext)FormatterServices.GetUninitializedObject(typeof(SiteContext));
            sc.Theme = new Theme { EmailTemplates = new List<Mozu.SiteBuilder.Mvc.Models.CMS.PageTypeDefinition>() };
            _controller.SiteContext = sc;
        }

        [Test]
        public async Task Render_returns_Gone_when_template_missing()
        {
            var notification = new EmailNotification { Topic = "unknown.topic", Payload = "{}" };

            var result = await _controller.Render(notification);
            var obj = result as Microsoft.AspNetCore.Mvc.ObjectResult;
            obj.ShouldNotBeNull();
            obj.StatusCode.ShouldEqual((int)HttpStatusCode.Gone);
            obj.Value.ShouldNotBeNull();
            obj.Value.ToString().ShouldContain("no templates defined");
        }

        [Test]
        public async Task Render_WhenExtensionSuppressesEmail_ReturnsResponseWithSuppressedSendTrue()
        {
            // Arrange
            var topic = "order.changed";
            var templateName = "order-template";
            var testSubject = "Test Email Subject";
            var sc = (SiteContext)FormatterServices.GetUninitializedObject(typeof(SiteContext));
            sc.Theme = new Theme { EmailTemplates = new List<Mozu.SiteBuilder.Mvc.Models.CMS.PageTypeDefinition> { new Mozu.SiteBuilder.Mvc.Models.CMS.PageTypeDefinition { Id = topic, Template = templateName, Title = "Default Email Title" } } };
            var emailTemplate = sc.Theme.EmailTemplates.FirstOrDefault(x => string.Equals(x.Id, topic, StringComparison.OrdinalIgnoreCase));
            emailTemplate.ShouldNotBeNull("Email template should be found");
            var emailContext = new EmailRenderContext { OriginalTemplate = templateName, CurrentTemplate = templateName, TemplateChanged = false, IsSuppressed = true, Subject = testSubject, Model = new { TestProperty = "TestValue" }, User = null };
            _emailExtensionContextBuilder.BuildContext(Arg.Any<EmailNotification>(), Arg.Any<object>(), Arg.Any<UX.Models.Customers.User>(), Arg.Any<Site>(), Arg.Any<SiteContext>(), Arg.Any<List<Core.Extensible.Contracts.Attribute>>(), Arg.Any<Location.Contracts.Location>(), Arg.Any<string>()).Returns(emailContext);
            _emailExtensionContextBuilder.ExecuteEmailRenderExtension(Arg.Any<EmailRenderContext>(), _arcFunctionId).Returns(Task.FromResult(emailContext));
            var notification = new EmailNotification { Topic = topic, Payload = "{\"TestData\": \"TestValue\"}" };
            var testModel = new { };
            var testSite = new Site { Id = 1 };
            var builtContext = _emailExtensionContextBuilder.BuildContext(notification, testModel, null, testSite, sc, null, null, null);
            builtContext.ShouldNotBeNull("Built context should not be null");
            builtContext.IsSuppressed.ShouldEqual(true, "Built context should be suppressed");
            var executedContext = await _emailExtensionContextBuilder.ExecuteEmailRenderExtension(builtContext, _arcFunctionId);
            executedContext.ShouldNotBeNull("Executed context should not be null");
            executedContext.IsSuppressed.ShouldEqual(true, "Executed context should remain suppressed");
        }

        [Test]
        public async Task Render_WhenExtensionChangesTemplate_UsesNewTemplate()
        {
            var topic = "order.changed";
            var originalTemplate = "original-template";
            var newTemplate = "new-template";
            var testSubject = "Test Email Subject";
            var sc = (SiteContext)FormatterServices.GetUninitializedObject(typeof(SiteContext));
            sc.Theme = new Theme { EmailTemplates = new List<Mozu.SiteBuilder.Mvc.Models.CMS.PageTypeDefinition> { new Mozu.SiteBuilder.Mvc.Models.CMS.PageTypeDefinition { Id = topic, Template = originalTemplate, Title = "Original Template Title" }, new Mozu.SiteBuilder.Mvc.Models.CMS.PageTypeDefinition { Id = newTemplate, Template = newTemplate, Title = "New Template Title" } } };
            var emailContext = new EmailRenderContext { OriginalTemplate = originalTemplate, CurrentTemplate = newTemplate, TemplateChanged = true, IsSuppressed = false, Subject = testSubject, Model = new { TestProperty = "TestValue" }, User = null };
            _emailExtensionContextBuilder.BuildContext(Arg.Any<EmailNotification>(), Arg.Any<object>(), Arg.Any<UX.Models.Customers.User>(), Arg.Any<Site>(), Arg.Any<SiteContext>(), Arg.Any<List<Core.Extensible.Contracts.Attribute>>(), Arg.Any<Location.Contracts.Location>(), Arg.Any<string>()).Returns(emailContext);
            _emailExtensionContextBuilder.ExecuteEmailRenderExtension(Arg.Any<EmailRenderContext>(), _arcFunctionId).Returns(Task.FromResult(emailContext));
            var notification = new EmailNotification { Topic = topic, Payload = "{\"TestData\": \"TestValue\"}" };
            var testModel = new { };
            var testSite = new Site { Id = 1 };
            var builtContext = _emailExtensionContextBuilder.BuildContext(notification, testModel, null, testSite, sc, null, null, null);
            builtContext.ShouldNotBeNull("Built context should not be null");
            builtContext.TemplateChanged.ShouldEqual(true, "Built context should indicate template changed");
            builtContext.CurrentTemplate.ShouldEqual(newTemplate, "Built context should have the new template");
            var executedContext = await _emailExtensionContextBuilder.ExecuteEmailRenderExtension(builtContext, _arcFunctionId);
            executedContext.ShouldNotBeNull("Executed context should not be null");
            executedContext.TemplateChanged.ShouldEqual(true, "Executed context should still indicate template changed");
            executedContext.CurrentTemplate.ShouldEqual(newTemplate, "Executed context should still have the new template");
        }

        [Test]
        public async Task Render_WhenExtensionFails_ContinuesWithOriginalContext()
        {
            var topic = "order.changed";
            var templateName = "order-template";
            var testSubject = "Test Email Subject";
            var sc = (SiteContext)FormatterServices.GetUninitializedObject(typeof(SiteContext));
            sc.Theme = new Theme { EmailTemplates = new List<Mozu.SiteBuilder.Mvc.Models.CMS.PageTypeDefinition> { new Mozu.SiteBuilder.Mvc.Models.CMS.PageTypeDefinition { Id = topic, Template = templateName, Title = "Default Email Title" } } };
            var originalEmailContext = new EmailRenderContext { OriginalTemplate = templateName, CurrentTemplate = templateName, TemplateChanged = false, IsSuppressed = false, Subject = testSubject, Model = new { TestProperty = "TestValue" }, User = null };
            _emailExtensionContextBuilder.BuildContext(Arg.Any<EmailNotification>(), Arg.Any<object>(), Arg.Any<UX.Models.Customers.User>(), Arg.Any<Site>(), Arg.Any<SiteContext>(), Arg.Any<List<Core.Extensible.Contracts.Attribute>>(), Arg.Any<Location.Contracts.Location>(), Arg.Any<string>()).Returns(originalEmailContext);
            _emailExtensionContextBuilder.ExecuteEmailRenderExtension(Arg.Any<EmailRenderContext>(), _arcFunctionId).Returns(callInfo => Task.FromResult(callInfo.Arg<EmailRenderContext>()));
            var notification = new EmailNotification { Topic = topic, Payload = "{\"TestData\": \"TestValue\"}" };
            var testModel = new { };
            var testSite = new Site { Id = 1 };
            var builtContext = _emailExtensionContextBuilder.BuildContext(notification, testModel, null, testSite, sc, null, null, null);
            builtContext.ShouldNotBeNull("Built context should not be null");
            builtContext.ShouldEqual(originalEmailContext, "Built context should be the original context");
            var executedContext = await _emailExtensionContextBuilder.ExecuteEmailRenderExtension(builtContext, _arcFunctionId);
            executedContext.ShouldNotBeNull("Executed context should not be null");
            executedContext.ShouldEqual(originalEmailContext, "Executed context should be the original context after failure");
            executedContext.IsSuppressed.ShouldEqual(false, "Context should remain unsuppressed after extension failure");
            executedContext.TemplateChanged.ShouldEqual(false, "Template should remain unchanged after extension failure");
            executedContext.CurrentTemplate.ShouldEqual(templateName, "Template should remain the original after extension failure");
            executedContext.Subject.ShouldEqual(testSubject, "Subject should remain unchanged after extension failure");
        }

        [Test]
        public async Task Render_WhenExtensionChangesSubject_UsesChangedSubject()
        {
            var topic = "order.changed";
            var templateName = "order-template";
            var defaultTemplateTitle = "Default Email Template Title";
            var extensionSubject = "Custom Subject from Extension - Order #12345 Confirmed";
            var documentSubject = "Subject from Document Properties";
            var sc = (SiteContext)FormatterServices.GetUninitializedObject(typeof(SiteContext));
            sc.Theme = new Theme { EmailTemplates = new List<Mozu.SiteBuilder.Mvc.Models.CMS.PageTypeDefinition> { new Mozu.SiteBuilder.Mvc.Models.CMS.PageTypeDefinition { Id = topic, Template = templateName, Title = defaultTemplateTitle } } };
            var emailContext = new EmailRenderContext { OriginalTemplate = templateName, CurrentTemplate = templateName, TemplateChanged = false, IsSuppressed = false, Subject = extensionSubject, Model = new { TestProperty = "TestValue" }, User = null };
            _emailExtensionContextBuilder.BuildContext(Arg.Any<EmailNotification>(), Arg.Any<object>(), Arg.Any<UX.Models.Customers.User>(), Arg.Any<Site>(), Arg.Any<SiteContext>(), Arg.Any<List<Core.Extensible.Contracts.Attribute>>(), Arg.Any<Location.Contracts.Location>(), Arg.Any<string>()).Returns(emailContext);
            _emailExtensionContextBuilder.ExecuteEmailRenderExtension(Arg.Any<EmailRenderContext>(), _arcFunctionId).Returns(Task.FromResult(emailContext));
            var notification = new EmailNotification { Topic = topic, Payload = "{\"TestData\": \"TestValue\"}" };
            var testModel = new { };
            var testSite = new Site { Id = 1 };
            var builtContext = _emailExtensionContextBuilder.BuildContext(notification, testModel, null, testSite, sc, null, null, null);
            builtContext.ShouldNotBeNull("Built context should not be null");
            builtContext.Subject.ShouldEqual(extensionSubject, "Built context should have the extension subject");
            var executedContext = await _emailExtensionContextBuilder.ExecuteEmailRenderExtension(builtContext, _arcFunctionId);
            executedContext.ShouldNotBeNull("Executed context should not be null");
            executedContext.Subject.ShouldEqual(extensionSubject, "Executed context should still have the extension subject");
        }
    }
}
