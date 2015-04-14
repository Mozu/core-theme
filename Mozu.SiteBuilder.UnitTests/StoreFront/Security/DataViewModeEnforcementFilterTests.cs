using AutofacContrib.NSubstitute;
using Mozu.Core;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;
using Mozu.Core.Test;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UnitTests.Utils;
using Mozu.SiteBuilder.UX.Filters;
using NSubstitute;
using NUnit.Framework;
using Should;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http.Controllers;

namespace Mozu.SiteBuilder.UnitTests.StoreFront.Security
{
    [TestFixture]
    [Category("Live/Pending permissions")]
    public class DataViewModeEnforcementFilterTests : UnitTestsFor<DataViewModeEnforcementAttribute>
    {
        [SetUp]
        public void Clear()
        {
            MockContainer = new AutoSubstitute();
        }

        [Test, TestCaseSource("GetTests")]
        public async Task DoTest(HandlerTest testcase)
        {
            var configuredContainer = MockContainer.WithLoginPath("http://mozu.com/login");
            MockContainer = testcase.SetupFunc(configuredContainer);

            InitObjectUnderTest();

            var message = HttpRequestMessageHelpers.CreateFromContainer(MockContainer.Container);
            MockContainer.WithRegisteredRequest(message).WithUrlFinder();
            message.RequestUri = new Uri(testcase.Route ?? "http://localhost/admin/test");
            var actionContext = MockOutMessage(message, MockContainer.Resolve<IHttpController>());

            var source = new CancellationTokenSource();
            var response = await ObjectUnderTest.ExecuteAuthorizationFilterAsync(actionContext, source.Token, () => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)));

            testcase.EvalFunc(response).ShouldBeTrue(string.Format("assertion on case {0} failed", testcase.Name));
        }

        private static HttpActionContext MockOutMessage(HttpRequestMessage message, IHttpController controller)
        {
            var controllerContext = new HttpControllerContext(new HttpRequestContext(), message, new HttpControllerDescriptor() {ControllerType = controller.GetType(), ControllerName = controller.GetType().FullName }, controller);
            var actionDesc = Substitute.For<HttpActionDescriptor>();
            var actionContext = new HttpActionContext(controllerContext, actionDesc);
            return actionContext;
        }

        private static IEnumerable<HandlerTest> GetTests()
        {
            yield return new HandlerTest()
            {
                Name = "Shopper can't go through when pending locked down",
                SetupFunc = mc => mc.WhenIsPendingRequest().WhenPendingIsLockedDown().WhenScopeIsShopper().WithSiteId().WithoutIgnoreAttribute(),
                EvalFunc = msg => msg.StatusCode == System.Net.HttpStatusCode.Redirect
            };
            yield return new HandlerTest()
            {
                Name = "Shopper can't go through when live locked down",
                SetupFunc = mc => mc.WhenIsLiveRequest().WhenLiveIsLockedDown().WhenScopeIsShopper().WithSiteId().WithoutIgnoreAttribute(),
                EvalFunc = msg => msg.StatusCode == System.Net.HttpStatusCode.Redirect
            };
            yield return new HandlerTest()
            {
                Name = "Admin can go through when locked down and pending behavior",
                SetupFunc = mc => mc.WhenIsPendingRequest().WhenPendingIsLockedDown().WhenScopeIsAdmin().WithPermission<Core.Behaviors.PublishPreviewBehavior>().WithoutIgnoreAttribute(),
                EvalFunc = msg => msg.StatusCode == System.Net.HttpStatusCode.OK
            };
            yield return new HandlerTest()
            {
                Name = "Admin can't go through when locked down and no pending behavior",
                SetupFunc = mc => mc.WhenIsPendingRequest().WhenPendingIsLockedDown().WhenScopeIsAdmin().WithoutPermission().WithSiteId().WithoutIgnoreAttribute(),
                EvalFunc = msg => msg.StatusCode == System.Net.HttpStatusCode.Redirect
            };
            yield return new HandlerTest()
            {
                Name = "Admin can't go through when live locked down and no permission",
                SetupFunc = mc => mc.WhenIsLiveRequest().WhenLiveIsLockedDown().WithoutPermission().WithSiteId().WithoutIgnoreAttribute(),
                EvalFunc = msg => msg.StatusCode == System.Net.HttpStatusCode.Redirect
            };
            yield return new HandlerTest()
            {
                Name = "Admin can go through when live locked down and has permission",
                SetupFunc = mc => mc.WhenIsLiveRequest().WhenLiveIsLockedDown().WhenScopeIsAdmin().WithPermission<Core.Behaviors.ViewLiveBehavior>().WithoutIgnoreAttribute(),
                EvalFunc = msg => msg.StatusCode == System.Net.HttpStatusCode.OK
            };
            yield return new HandlerTest()
            {
                Name = "Admin can go through when live isn't locked down",
                SetupFunc = mc => mc.WhenIsLiveRequest().WhenEverythingIsOpen().WhenScopeIsAdmin().WithPermission<Core.Behaviors.ViewLiveBehavior>().WithoutIgnoreAttribute(),
                EvalFunc = msg => msg.StatusCode == System.Net.HttpStatusCode.OK
            };
            yield return new HandlerTest()
            {
                Name = "Shopper can go through when live isn't locked down",
                SetupFunc = mc => mc.WhenIsLiveRequest().WhenEverythingIsOpen().WhenScopeIsShopper().WithPermission<Core.Behaviors.ViewLiveBehavior>().WithoutIgnoreAttribute(),
                EvalFunc = msg => msg.StatusCode == System.Net.HttpStatusCode.OK
            };

            yield return new HandlerTest()
            {
                Name = "Requests to storefront pants go through all the time",
                Route = "http://localhost/auth/pants",
                SetupFunc = mc => mc.WhenIsPendingRequest().WhenPendingIsLockedDown().WhenScopeIsShopper().WithoutIgnoreAttribute(),
                EvalFunc = msg => msg.StatusCode == System.Net.HttpStatusCode.OK
            };
            yield return new HandlerTest()
            {
                Name = "Unauth redirect has correct path",
                SetupFunc = mc => mc.WhenIsLiveRequest().WhenLiveIsLockedDown().WhenScopeIsAdmin().WithSiteId().WithoutIgnoreAttribute(),
                EvalFunc = msg => IsRedirectTo(msg, "login/unauthorized/index")
            };
            yield return new HandlerTest()
            {
                Name = "Login redirect has correct path",
                SetupFunc = mc => mc.WhenIsLiveRequest().WhenLiveIsLockedDown().WhenScopeIsShopper().WithSiteId().WithoutIgnoreAttribute(),
                EvalFunc = msg => IsRedirectTo(msg, "login/to")
            };
            yield return new HandlerTest()
            {
                Name = "controllers with ignore attr do not go through",
                SetupFunc = mc => mc.WithIgnoreAttribute(),
                EvalFunc = mc => mc.IsSuccessStatusCode && mc.StatusCode == HttpStatusCode.OK
            };
        }

        static HttpStatusCode[] redirectCodes = new[] { HttpStatusCode.Redirect, HttpStatusCode.RedirectKeepVerb, HttpStatusCode.RedirectMethod, HttpStatusCode.TemporaryRedirect };
        static bool IsRedirect(HttpResponseMessage msg)
        {
            return redirectCodes.Contains(msg.StatusCode);
        }

        static bool IsRedirectTo(HttpResponseMessage msg, string route)
        {
            return IsRedirect(msg) && msg.Headers.Location.AbsolutePath.Trim('/').EqualsIgnoreCase(route);
        }

        private class EchoHandler : DelegatingHandler
        {
            protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                return Task.FromResult(request.CreateResponse(System.Net.HttpStatusCode.OK));
            }
        }
    }

    public struct HandlerTest
    {
        public string Name { get; set; }
        public string Route { get; set; }
        public Func<AutoSubstitute, AutoSubstitute> SetupFunc { get; set; }
        public Func<HttpResponseMessage, bool> EvalFunc { get; set; }
        public override string ToString()
        {
            return Name;
        }
    }

    public static class ContainerExtensions
    {
        public static AutoSubstitute WhenLiveIsLockedDown(this AutoSubstitute container)
        {
            return container.DoWithUpdate<ISiteContext>(ctx =>
            {
                if (ctx.GeneralSettings == null) ctx.GeneralSettings.Returns(new UX.Models.Settings.GeneralSettings());
                var genSettings = ctx.GeneralSettings;
                genSettings.IsRequiredLoginForLiveEnabled = true;
            });
        }

        public static AutoSubstitute WhenPendingIsLockedDown(this AutoSubstitute container)
        {
            return container.DoWithUpdate<ISiteContext>(context =>
            {
                if (context.GeneralSettings == null) context.GeneralSettings.Returns(new UX.Models.Settings.GeneralSettings());
                var genSettings = context.GeneralSettings;
                genSettings.IsRequiredLoginForStagingEnabled = true;
            });
        }

        public static AutoSubstitute WhenEverythingIsOpen(this AutoSubstitute container)
        {
            return container.DoWithUpdate<ISiteContext>(ctx =>
            {
                if (ctx.GeneralSettings == null) ctx.GeneralSettings.Returns(new UX.Models.Settings.GeneralSettings());
                ctx.GeneralSettings.IsRequiredLoginForLiveEnabled = ctx.GeneralSettings.IsRequiredLoginForStagingEnabled = false;
            });
        }

        public static AutoSubstitute WithRegisteredRequest(this AutoSubstitute container, HttpRequestMessage request)
        {
            container.Provide<HttpRequestMessage>(request);
            return container;
        }
        public static AutoSubstitute WithUrlFinder(this AutoSubstitute container)
        {
            container.Provide<IRequestUrlFinderOuter>(new RequestUrlFinderOuter(container.Resolve<HttpRequestMessage>()));
            return container;
        }

        public static AutoSubstitute WhenScopeIsShopper(this AutoSubstitute container)
        {
            // shopper scope means no admin token
            return container.DoWithUpdate<IAuthenticationHelper>(h => h.GetAdminAccessToken().Returns(string.Empty));
        }

        public static AutoSubstitute WhenScopeIsAdmin(this AutoSubstitute container)
        {
            return container.DoWithUpdate<IAuthenticationHelper>(h => h.GetAdminAccessToken().Returns("yay I have a token"));
        }
        public static AutoSubstitute WithPermission<T>(this AutoSubstitute container) where T : Core.Behaviors.BehaviorDefinition, new()
        {
            return container.DoWithUpdate<IAuthenticationHelper>(ah =>
            {
                ah.GetAdminAccessToken().Returns(LightweightUserClaims.CreateForAdminUser("testuser", string.Empty, string.Empty, new int[] { new T().Id }, new UserScope(), DateTime.UtcNow.AddDays(7)).ToAccessToken());
            }).DoWithUpdate<ISiteBuilderApiContext>(ctx => ctx.UserClaims.Returns(LightweightUserClaims.CreateForAnonymousShopper(10, 12)));
        }
        public static AutoSubstitute WithoutPermission(this AutoSubstitute container)
        {
            return container.DoWithUpdate<IAuthenticationHelper>(ah =>
            {
                ah.GetAdminAccessToken().Returns(LightweightUserClaims.CreateForAdminUser("testuser", string.Empty, string.Empty, new int[] { }, new UserScope(), DateTime.UtcNow.AddDays(7)).ToAccessToken());
            }).DoWithUpdate<ISiteBuilderApiContext>(ctx => ctx.UserClaims.Returns(LightweightUserClaims.CreateForAnonymousShopper(10, 12)));
        }

        public static AutoSubstitute WhenIsPendingRequest(this AutoSubstitute container)
        {
            return container.WithDataViewMode(DataViewModeType.Pending);
        }
        public static AutoSubstitute WhenIsLiveRequest(this AutoSubstitute container)
        {
            return container.WithDataViewMode(DataViewModeType.Live);
        }

        public static AutoSubstitute WithDataViewMode(this AutoSubstitute container, DataViewModeType t)
        {
            return container.DoWithUpdate<ISiteBuilderApiContext>(ctx => ctx.DataViewMode.Returns(t));
        }

        public static AutoSubstitute WithSiteId(this AutoSubstitute container)
        {
            return container.DoWithUpdate<ISiteBuilderApiContext>(ctx => ctx.SiteId.Returns(1));
        }

        public static AutoSubstitute WithLoginPath(this AutoSubstitute container, string loginPath)
        {
            return container.DoWithUpdate<ISettings>(settings => settings.LoginPath.Returns(loginPath));
        }

        private static AutoSubstitute DoWithUpdate<T>(this AutoSubstitute container, Action<T> updater) where T : class
        {
            var i = container.Resolve<T>();
            updater(i);
            container.Provide(i);
            return container;
        }

        public static AutoSubstitute WithIgnoreAttribute(this AutoSubstitute container)
        {
            var ctrl = container.Provide<IHttpController>(new MockTestIgnoreController());
            return container;
        }
        public static AutoSubstitute WithoutIgnoreAttribute(this AutoSubstitute container)
        {
            var ctrl = container.Provide<IHttpController>(new MockTestController());
            return container;
        }

        [DataViewModeEnforcement]
        public class MockTestController : IHttpController
        {
            public Task<HttpResponseMessage> ExecuteAsync(HttpControllerContext controllerContext, CancellationToken cancellationToken)
            {
                throw new NotImplementedException();
            }
        }

        [IgnoreDataViewMode]
        public class MockTestIgnoreController : MockTestController
        {
        }
    }
}
