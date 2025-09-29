using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Runtime.Serialization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Mozu.Core.Actions;
using Mozu.Core.Actions.Contracts;
using Mozu.Core.Api.ErrorHandler;
using Mozu.Core.Messaging.Contracts.Notification;
using Mozu.Core.Observability;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.ArcJsExtensions;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.UX.Models.Customers;
using Mozu.SiteBuilder.UX.Models.StoreFront.Email;
using Mozu.Tenant.Contracts;
using NSubstitute;
using NUnit.Framework;
using Microsoft.Extensions.Logging.Abstractions;

namespace Mozu.SiteBuilder.UnitTests.ArcJsExtensions
{
    [TestFixture]
    public class EmailExtensionContextBuilderTests
    {
        private IFunctionProvider _functionProvider;
        private EmailExtensionContextBuilder _builder;
        private SiteContext _siteContext;
        private Theme _theme;
        private ILoggerFactory _loggerFactory;
        private readonly string _arcFunctionId = "embedded.commerce.email.render.before";

        [SetUp]
        public void SetUp()
        {
            _functionProvider = Substitute.For<IFunctionProvider>();

            // Create a proper logger factory
            _loggerFactory = Substitute.For<ILoggerFactory>();
            _loggerFactory.CreateLogger(Arg.Any<string>()).Returns(NullLogger.Instance);
            _loggerFactory.CreateLogger<EmailExtensionContextBuilder>().Returns(NullLogger<EmailExtensionContextBuilder>.Instance);

            var secureDataHandler = Substitute.For<ISecureAppDataHandler>();
            var apiContext = Substitute.For<Mozu.Core.IApiContext>();
            
            // NodePoolManager can be null for these tests
            NodePoolManager nodePoolManager = null;
            
            var mozuSettings = Substitute.For<IMozuSettings>();
            var apiExceptionHandler = Substitute.For<IApiExceptionHandlerService>();
            var httpContextAccessor = Substitute.For<IHttpContextAccessor>();
            httpContextAccessor.HttpContext.Returns(new DefaultHttpContext());
            var observability = Substitute.For<IObservabilityOptions>();

            _builder = new EmailExtensionContextBuilder(
                _functionProvider,
                _loggerFactory,
                secureDataHandler,
                apiContext,
                nodePoolManager,
                mozuSettings,
                apiExceptionHandler,
                httpContextAccessor,
                observability);

            _theme = new Theme
            {
                EmailTemplates = new List<Mozu.SiteBuilder.Mvc.Models.CMS.PageTypeDefinition>
                {
                    new Mozu.SiteBuilder.Mvc.Models.CMS.PageTypeDefinition{ Id = "order.changed", Template = "orderChangedTemplate" }
                }
            };

            // Create a SiteContext using FormatterServices to avoid constructor issues
            _siteContext = (SiteContext)FormatterServices.GetUninitializedObject(typeof(SiteContext));
            _siteContext.Theme = _theme;
        }

        private static List<Core.Extensible.Contracts.Attribute> EmptyAttributes => new();
        private static Location.Contracts.Location NullLocation => null;

        [Test]
        public void BuildContext_sets_expected_defaults()
        {
            var notification = new EmailNotification { Topic = "order.changed" };
            var user = new User { Email = "u@test.com" };
            var site = new Site { Domains = new List<Domain> { new Domain { DomainName = "abc" } } };
            var model = new { A = 1 };
            
            var ctx = _builder.BuildContext(notification, model, user, site, _siteContext, EmptyAttributes, NullLocation, null);
            
            Assert.That(ctx.Subject, Is.EqualTo("order.changed"));
            Assert.That(ctx.OriginalTemplate, Is.EqualTo("orderChangedTemplate"));
            Assert.That(ctx.CurrentTemplate, Is.EqualTo("orderChangedTemplate"));
            Assert.False(ctx.TemplateChanged);
            Assert.False(ctx.IsSuppressed);
            Assert.That(ctx.Model, Is.EqualTo(model));
            Assert.That(ctx.User, Is.EqualTo(user));
            Assert.That(ctx.Site, Is.EqualTo(site));
            Assert.That(ctx.Notification, Is.EqualTo(notification));
        }

        [Test]
        public void BuildContext_with_emailTitle_overrides_topic()
        {
            // Arrange
            var notification = new EmailNotification { Topic = "order.changed" };
            var customTitle = "Custom Order Changed Subject";
            var user = new User { Email = "user@test.com" };
            var site = new Site { Domains = new List<Domain> { new Domain { DomainName = "primarydomain.com", IsPrimary = true } } };
            var model = new { Foo = 42 };

            // Act
            var ctx = _builder.BuildContext(notification, model, user, site, _siteContext, EmptyAttributes, NullLocation, customTitle);

            // Assert
            Assert.That(ctx.Subject, Is.EqualTo(customTitle), "Subject should use provided emailTitle");
            Assert.That(ctx.Subject, Is.Not.EqualTo(notification.Topic), "Subject should not fallback to topic when emailTitle supplied");
            Assert.That(ctx.OriginalTemplate, Is.EqualTo("orderChangedTemplate"));
            Assert.That(ctx.CurrentTemplate, Is.EqualTo("orderChangedTemplate"));
            Assert.False(ctx.IsSuppressed);
        }

        [Test]
        public void BuildContext_with_no_matching_template_returns_null_template()
        {
            var notification = new EmailNotification { Topic = "non.existent.topic" };
            var user = new User { Email = "u@test.com" };
            var site = new Site { Domains = new List<Domain> { new Domain { DomainName = "abc" } } };
            var model = new { A = 1 };
            
            var ctx = _builder.BuildContext(notification, model, user, site, _siteContext, EmptyAttributes, NullLocation, null);
            
            Assert.That(ctx.Subject, Is.EqualTo("non.existent.topic"));
            Assert.That(ctx.OriginalTemplate, Is.Null);
            Assert.That(ctx.CurrentTemplate, Is.Null);
            Assert.That(ctx.Template, Is.Null);
            Assert.False(ctx.TemplateChanged);
            Assert.False(ctx.IsSuppressed);
        }

        [Test]
        public void CreateExtensionContext_populates_items_and_viewdata()
        {
            var notification = new EmailNotification { Topic = "order.changed" };
            var site = new Site { Domains = new List<Domain> { new Domain { DomainName = "abc" } } };
            var ctx = _builder.BuildContext(notification, new { }, null, site, _siteContext, EmptyAttributes, NullLocation, null);
            
            var ext = _builder.CreateExtensionContext(ctx);
            
            Assert.That(ext.Items.ContainsKey("emailRenderContext"));
            Assert.That(ext.Items.ContainsKey("viewData"));
            Assert.That(ext.ExecDelegates.ContainsKey("setSubject"));

            // Verify the email context is properly stored
            var storedContext = ext.Items["emailRenderContext"] as EmailRenderContext;
            Assert.That(storedContext, Is.EqualTo(ctx));
        }

        [Test]
        public async Task ExecuteEmailRenderExtension_handles_no_functions_gracefully()
        {
            _functionProvider.GetFunctions(Arg.Any<string>()).Returns((IEnumerable<CustomFunctionBase>)null);
            var notification = new EmailNotification { Topic = "order.changed" };
            var site = new Site { Domains = new List<Domain> { new Domain { DomainName = "abc" } } };
            var ctx = _builder.BuildContext(notification, new { }, null, site, _siteContext, EmptyAttributes, NullLocation, null);
            
            var result = await _builder.ExecuteEmailRenderExtension(ctx, _arcFunctionId);
            
            Assert.That(result.Subject, Is.EqualTo("order.changed"));
            Assert.That(result, Is.EqualTo(ctx)); // Should return the same context unchanged
        }

        [Test]
        public async Task ExecuteEmailRenderExtension_with_empty_function_list_returns_same_context()
        {
            var site = new Site { Domains = new List<Domain> { new Domain { DomainName = "abc" } } };
            _functionProvider.GetFunctions(Arg.Any<string>()).Returns(new List<CustomFunctionBase>());
            var ctx = _builder.BuildContext(new EmailNotification { Topic = "order.changed" }, new { }, null, site, _siteContext, EmptyAttributes, NullLocation, null);
            
            var result = await _builder.ExecuteEmailRenderExtension(ctx, _arcFunctionId);
            
            Assert.That(result.Subject, Is.EqualTo("order.changed"));
            Assert.That(result, Is.EqualTo(ctx)); // Should return the same context unchanged
        }

        [Test]
        public async Task ExecuteEmailRenderExtension_calls_function_provider_with_correct_key()
        {
            _functionProvider.GetFunctions(Arg.Any<string>()).Returns(new List<CustomFunctionBase>());
            var site = new Site { Domains = new List<Domain> { new Domain { DomainName = "abc" } } };
            var ctx = _builder.BuildContext(new EmailNotification { Topic = "order.changed" }, new { }, null, site, _siteContext, EmptyAttributes, NullLocation, null);
            
            await _builder.ExecuteEmailRenderExtension(ctx, _arcFunctionId);
            
            // Verify the function provider was called with the correct extension key
            await _functionProvider.Received(1).GetFunctions("embedded.commerce.email.render.before");
        }

        [Test]
        public void CreateExtensionContext_populates_viewdata_with_email_context_properties()
        {
            var emailContext = new EmailRenderContext
            {
                Content = "test content",
                Subject = "test subject",
                User = new User { Email = "test@example.com" },
                Site = new Site { Id = 1 },
                RmaLocation = new Location.Contracts.Location { Code = "RMA1" },
                DomainName = "test.com",
                StoreFrontAttributes = new { Attr = "value" }
            };
            
            var ext = _builder.CreateExtensionContext(emailContext);
            
            // Get the ViewData from the extension context
            var viewData = ext.Items["viewData"] as Microsoft.AspNetCore.Mvc.ViewFeatures.ViewDataDictionary;
            
            Assert.That(viewData, Is.Not.Null);
            Assert.That(viewData["content"], Is.EqualTo("test content"));
            Assert.That(viewData["subject"], Is.EqualTo("test subject"));
            Assert.That(viewData["User"], Is.EqualTo(emailContext.User));
            Assert.That(viewData["site"], Is.EqualTo(emailContext.Site));
            Assert.That(viewData["rmaLocation"], Is.EqualTo(emailContext.RmaLocation));
            Assert.That(viewData["domainName"], Is.EqualTo("test.com"));
            Assert.That(viewData["storefrontOrderAttributes"], Is.EqualTo(emailContext.StoreFrontAttributes));
        }

        [Test]
        public void GetEmailTemplate_returns_correct_template_for_matching_topic()
        {
            // This tests the private method indirectly through BuildContext
            var notification = new EmailNotification { Topic = "ORDER.CHANGED" }; // Test case insensitivity
            var site = new Site { Domains = new List<Domain> { new Domain { DomainName = "abc" } } };

            var ctx = _builder.BuildContext(notification, new { }, null, site, _siteContext, EmptyAttributes, NullLocation, null);
            
            Assert.That(ctx.OriginalTemplate, Is.EqualTo("orderChangedTemplate"));
            Assert.That(ctx.CurrentTemplate, Is.EqualTo("orderChangedTemplate"));
            Assert.That(ctx.Template, Is.EqualTo("orderChangedTemplate"));
        }

        [Test]
        public void EmailRenderContext_can_be_created_directly()
        {
            // Test the data structures without any dependencies
            var context = new EmailRenderContext
            {
                OriginalTemplate = "test-template",
                CurrentTemplate = "test-template",
                TemplateChanged = false,
                IsSuppressed = false,
                Subject = "test-subject"
            };

            Assert.That(context.OriginalTemplate, Is.EqualTo("test-template"));
            Assert.That(context.TemplateChanged, Is.False);
            Assert.That(context.IsSuppressed, Is.False);
            Assert.That(context.Subject, Is.EqualTo("test-subject"));
        }
    }
}
