using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using Mozu.Core.Actions.Contracts;
using Mozu.SiteBuilder.Mvc.ArcJsExtensions;
using Mozu.SiteBuilder.UX.Models.StoreFront.Email;
using Mozu.Tenant.Contracts;

namespace Mozu.SiteBuilder.UnitTests.ArcJsExtensions
{
    [TestFixture]
    public class EmailExtensionApiBindingTests
    {
        private ApiActionExtensionFilterContext _context;
        private EmailRenderContext _emailRenderContext;
        private ViewDataDictionary _viewData;

        [SetUp]
        public void SetUp()
        {
            var testUser = new UX.Models.Customers.User
            {
                Email = "test@example.com",
                FirstName = "John",
                LastName = "Doe",
                UserId = "user123",
                IsAuthenticated = true
            };

            var testSite = new Site
            {
                Id = 123,
                Name = "Test Site",
                TenantId = 1000,
                MasterCatalogId = 1,
                CatalogId = 1
            };

            var testRmaLocation = new Location.Contracts.Location
            {
                Name = "Test Location",
                Code = "LOC123"
            };

            _emailRenderContext = new EmailRenderContext
            {
                Subject = "orig-subject",
                CurrentTemplate = "templateA",
                OriginalTemplate = "templateA",
                IsSuppressed = false,
                TemplateChanged = false,
                Model = new { Foo = 1 },
                Content = "<html><body>Test Content</body></html>",
                User = testUser,
                Site = testSite,
                RmaLocation = testRmaLocation,
                DomainName = "testdomain.com",
                StoreFrontAttributes = new { OrderType = "Standard" }
            };

            var dummyActionContext = new Microsoft.AspNetCore.Mvc.ActionContext(
                new DefaultHttpContext(),
                new RouteData(),
                new ActionDescriptor());

            var execCtx = new Microsoft.AspNetCore.Mvc.Filters.ActionExecutingContext(
                dummyActionContext,
                new List<Microsoft.AspNetCore.Mvc.Filters.IFilterMetadata>(),
                new Dictionary<string, object>(),
                controller: null);

            _context = new ApiActionExtensionFilterContext(null, execCtx, null, null)
            {
                Items = new Dictionary<string, object>(),
                ExecDelegates = new Dictionary<string, Func<object[], Task>>(),
                GlobalContext = new Dictionary<string, GlobalContextItem>()
            };

            _viewData = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
            {
                Model = _emailRenderContext.Model
            };

            _viewData["content"] = _emailRenderContext.Content;
            _viewData["User"] = _emailRenderContext.User;
            _viewData["site"] = _emailRenderContext.Site;
            _viewData["rmaLocation"] = _emailRenderContext.RmaLocation;
            _viewData["domainName"] = _emailRenderContext.DomainName;
            _viewData["storefrontOrderAttributes"] = _emailRenderContext.StoreFrontAttributes;
            _viewData["subject"] = _emailRenderContext.Subject;

            _context.Items["emailRenderContext"] = _emailRenderContext;
            _context.Items["viewData"] = _viewData;

            EmailExtensionApiBinding.ConfigureEmailApiExtensions(_context);
        }

        [Test]
        public void ConfigureEmailApiExtensions_registers_expected_delegates()
        {
            Assert.That(_context.ExecDelegates.ContainsKey("setSubject"));
            Assert.That(_context.ExecDelegates.ContainsKey("suppressEmail"));
            Assert.That(_context.ExecDelegates.ContainsKey("setTemplate"));
            Assert.That(_context.ExecDelegates.ContainsKey("setContent"));
            Assert.That(_context.ExecDelegates.ContainsKey("setModel"));
            Assert.That(_context.ExecDelegates.ContainsKey("setUser"));
        }

        [Test]
        public void ConfigureEmailApiExtensions_registers_expected_item_getters()
        {
            // Getters now live in Items (not GlobalContext) after refactor
            Assert.That(_context.Items.ContainsKey("getContent"));
            Assert.That(_context.Items.ContainsKey("getUser"));
            Assert.That(_context.Items.ContainsKey("getSite"));
            Assert.That(_context.Items.ContainsKey("getModel"));
            Assert.That(_context.Items.ContainsKey("getRmaLocation"));
            Assert.That(_context.Items.ContainsKey("getDomainName"));
            Assert.That(_context.Items.ContainsKey("getStorefrontOrderAttributes"));
            Assert.That(_context.Items.ContainsKey("getSubject"));
        }

        [Test]
        public void Getter_items_return_correct_values_from_EmailRenderContext()
        {
            Assert.That(_context.Items["getContent"], Is.EqualTo(_emailRenderContext.Content));
            Assert.That(_context.Items["getUser"], Is.EqualTo(_emailRenderContext.User));
            Assert.That(_context.Items["getSite"], Is.EqualTo(_emailRenderContext.Site));
            Assert.That(_context.Items["getModel"], Is.EqualTo(_emailRenderContext.Model));
            Assert.That(_context.Items["getRmaLocation"], Is.EqualTo(_emailRenderContext.RmaLocation));
            Assert.That(_context.Items["getDomainName"], Is.EqualTo(_emailRenderContext.DomainName));
            Assert.That(_context.Items["getStorefrontOrderAttributes"], Is.EqualTo(_emailRenderContext.StoreFrontAttributes));
            Assert.That(_context.Items["getSubject"], Is.EqualTo(_emailRenderContext.Subject));

            var user = (UX.Models.Customers.User)_context.Items["getUser"];
            Assert.That(user.Email, Is.EqualTo("test@example.com"));
            Assert.That(user.FirstName, Is.EqualTo("John"));
            Assert.That(user.LastName, Is.EqualTo("Doe"));
            Assert.That(user.UserId, Is.EqualTo("user123"));

            var site = (Site)_context.Items["getSite"];
            Assert.That(site.Id, Is.EqualTo(123));
            Assert.That(site.Name, Is.EqualTo("Test Site"));
        }

        [Test]
        public async Task setContent_updates_getContent_item()
        {
            var newContent = new JObject { ["x"] = 42, ["name"] = "updated" };
            await _context.ExecDelegates["setContent"](new object[] { new JArray(newContent) });
            Assert.That(_context.Items["getContent"], Is.EqualTo(newContent));
            Assert.That(_emailRenderContext.Content, Is.EqualTo(newContent));
            Assert.That(_viewData["content"], Is.EqualTo(newContent));
        }

        [Test]
        public async Task setUser_updates_getUser_item()
        {
            var newUser = new UX.Models.Customers.User
            {
                Email = "updated@example.com",
                FirstName = "Jane",
                LastName = "Smith",
                UserId = "user456",
                IsAuthenticated = true
            };
            await _context.ExecDelegates["setUser"](new object[] { newUser });
            var getterUser = (UX.Models.Customers.User)_context.Items["getUser"];
            Assert.That(getterUser, Is.EqualTo(newUser));
            Assert.That(getterUser.Email, Is.EqualTo("updated@example.com"));
            Assert.That(getterUser.FirstName, Is.EqualTo("Jane"));
            Assert.That(getterUser.LastName, Is.EqualTo("Smith"));
            Assert.That(getterUser.UserId, Is.EqualTo("user456"));
            Assert.That(_emailRenderContext.User, Is.EqualTo(newUser));
            Assert.That(_viewData["User"], Is.EqualTo(newUser));
        }

        [Test]
        public async Task setModel_updates_getModel_item()
        {
            var newModel = new JObject { ["x"] = 42, ["name"] = "updated" };
            await _context.ExecDelegates["setModel"](new object[] { new JArray(newModel) });
            Assert.That(_context.Items["getModel"], Is.EqualTo(newModel));
            Assert.That(_emailRenderContext.Model, Is.EqualTo(newModel));
            Assert.That(_viewData.Model, Is.EqualTo(newModel));
        }

        [Test]
        public async Task setSubject_updates_subject_and_viewdata_and_items()
        {
            await _context.ExecDelegates["setSubject"](new object[] { new JArray("new subject") });
            Assert.That(_emailRenderContext.Subject, Is.EqualTo("new subject"));
            Assert.That(_viewData["subject"], Is.EqualTo("new subject"));
            Assert.That(_context.Items["getSubject"], Is.EqualTo("new subject"));
        }

        [Test]
        public async Task suppressEmail_sets_flag_and_updates_items()
        {
            await _context.ExecDelegates["suppressEmail"](Array.Empty<object>());
            Assert.That(_emailRenderContext.IsSuppressed, Is.True);
            // getSubject unchanged; suppression reflected in emailRenderContext only
            Assert.That(_context.Items["emailRenderContext"], Is.EqualTo(_emailRenderContext));
        }

        [Test]
        public async Task setTemplate_updates_template_and_flag()
        {
            await _context.ExecDelegates["setTemplate"](new object[] { new JArray("templateB") });
            Assert.That(_emailRenderContext.CurrentTemplate, Is.EqualTo("templateB"));
            Assert.That(_emailRenderContext.TemplateChanged, Is.True);
        }

        [Test]
        public async Task setContent_updates_content_and_viewdata()
        {
            var content = new JObject { ["x"] = 42 };
            await _context.ExecDelegates["setContent"](new object[] { new JArray(content) });
            Assert.That(_emailRenderContext.Content, Is.EqualTo(content));
            Assert.That(_viewData["content"], Is.EqualTo(content));
        }

        [Test]
        public async Task setModel_updates_model_and_viewdata()
        {
            var model = new JObject { ["x"] = 42 };
            await _context.ExecDelegates["setModel"](new object[] { new JArray(model) });
            Assert.That(_emailRenderContext.Model, Is.EqualTo(model));
            Assert.That(_viewData.Model, Is.EqualTo(model));
        }

        [Test]
        public async Task setUser_updates_user_and_viewdata()
        {
            var user = new UX.Models.Customers.User { Email = "test@example.com" };
            await _context.ExecDelegates["setUser"](new object[] { user });
            Assert.That(_emailRenderContext.User, Is.EqualTo(user));
            Assert.That(_viewData["User"], Is.EqualTo(user));
        }
    }
}
