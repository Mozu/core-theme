//using AutofacContrib.NSubstitute;
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
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Mozu.SiteBuilder.UX.Controllers;

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

            var context = HttpContextHelpers.CreateFromContainer(MockContainer.Container);
            MockContainer.WithRegisteredHttpContext(context).WithUrlFinder();
            var uri = new Uri(testcase.Route ?? "http://localhost/admin/test");
            context.Request.Path = uri.AbsolutePath;

            var actionContext = MockActionContext(context);

            var authFilterContext = new AuthorizationFilterContext(actionContext, MockContainer.Resolve<IList<IFilterMetadata>>());

            await ObjectUnderTest.OnAuthorizationAsync(authFilterContext);

            testcase.EvalFunc(authFilterContext.Result).ShouldBeTrue($"assertion on case {testcase.Name} failed");
        }

        private static ActionContext MockActionContext(HttpContext httpContext)
        {
            var actionContext = new ActionContext(httpContext, new RouteData(), new ActionDescriptor());
            return actionContext;
        }

        private static IEnumerable<HandlerTest> GetTests()
        {
            yield return new HandlerTest()
            {
                Name = "Shopper can't go through when pending locked down",
                SetupFunc = mc => mc.WhenIsPendingRequest().WhenPendingIsLockedDown().WhenScopeIsShopper().WithSiteId().WithoutIgnoreAttribute(),
                EvalFunc = IsRedirect
            };
            yield return new HandlerTest()
            {
                Name = "Shopper can't go through when live locked down",
                SetupFunc = mc => mc.WhenIsLiveRequest().WhenLiveIsLockedDown().WhenScopeIsShopper().WithSiteId().WithoutIgnoreAttribute(),
                EvalFunc = IsRedirect
            };
            yield return new HandlerTest()
            {
                Name = "Admin can go through when locked down and pending behavior",
                SetupFunc = mc => mc.WhenIsPendingRequest().WhenPendingIsLockedDown().WhenScopeIsAdmin().WithPermission<Core.Behaviors.PublishPreviewBehavior>().WithoutIgnoreAttribute(),
                EvalFunc = resp => resp == null
            };
            yield return new HandlerTest()
            {
                Name = "Admin can't go through when locked down and no pending behavior",
                SetupFunc = mc => mc.WhenIsPendingRequest().WhenPendingIsLockedDown().WhenScopeIsAdmin().WithoutPermission().WithSiteId().WithoutIgnoreAttribute(),
                EvalFunc = IsRedirect
            };
            yield return new HandlerTest()
            {
                Name = "Admin can't go through when live locked down and no permission",
                SetupFunc = mc => mc.WhenIsLiveRequest().WhenLiveIsLockedDown().WithoutPermission().WithSiteId().WithoutIgnoreAttribute(),
                EvalFunc = IsRedirect
            };
            yield return new HandlerTest()
            {
                Name = "Admin can go through when live locked down and has permission",
                SetupFunc = mc => mc.WhenIsLiveRequest().WhenLiveIsLockedDown().WhenScopeIsAdmin().WithPermission<Core.Behaviors.ViewLiveBehavior>().WithoutIgnoreAttribute(),
                EvalFunc = resp => resp == null
            };
            yield return new HandlerTest()
            {
                Name = "Admin can go through when live isn't locked down",
                SetupFunc = mc => mc.WhenIsLiveRequest().WhenEverythingIsOpen().WhenScopeIsAdmin().WithPermission<Core.Behaviors.ViewLiveBehavior>().WithoutIgnoreAttribute(),
                EvalFunc = resp => resp == null
            };
            yield return new HandlerTest()
            {
                Name = "Shopper can go through when live isn't locked down",
                SetupFunc = mc => mc.WhenIsLiveRequest().WhenEverythingIsOpen().WhenScopeIsShopper().WithPermission<Core.Behaviors.ViewLiveBehavior>().WithoutIgnoreAttribute(),
                EvalFunc = resp => resp == null
            };

            yield return new HandlerTest()
            {
                Name = "Requests to storefront pants go through all the time",
                Route = "http://localhost/auth/pants",
                SetupFunc = mc => mc.WhenIsPendingRequest().WhenPendingIsLockedDown().WhenScopeIsShopper().WithoutIgnoreAttribute(),
                EvalFunc = resp => resp == null
            };
            yield return new HandlerTest()
            {
                Name = "Unauth redirect has correct path",
                SetupFunc = mc => mc.WhenIsLiveRequest().WhenLiveIsLockedDown().WhenScopeIsAdmin().WithSiteId().WithoutIgnoreAttribute(),
                EvalFunc = resp => IsRedirectTo(resp, "login/unauthorized/index")
            };
            yield return new HandlerTest()
            {
                Name = "Login redirect has correct path",
                SetupFunc = mc => mc.WhenIsLiveRequest().WhenLiveIsLockedDown().WhenScopeIsShopper().WithSiteId().WithoutIgnoreAttribute(),
                EvalFunc = resp => IsRedirectTo(resp, "login/to")
            };
            yield return new HandlerTest()
            {
                Name = "controllers with ignore attr do not go through",
                SetupFunc = mc => mc.WithIgnoreAttribute(),
                EvalFunc = resp => resp == null
            };
        }

        private static bool IsRedirect(IActionResult result)
        {
            return result is RedirectResult;
        }

        private static bool IsRedirectTo(IActionResult result, string route)
        {
            return IsRedirect(result) && (result as RedirectResult).Url.Trim('/').EqualsIgnoreCase(route);
        }

        //private class EchoHandler : DelegatingHandler
        //{
        //    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        //    {
        //        return Task.FromResult(request.CreateResponse(System.Net.HttpStatusCode.OK));
        //    }
        //}
    }

    public struct HandlerTest
    {
        public string Name { get; set; }
        public string Route { get; set; }
        public Func<AutoSubstitute, AutoSubstitute> SetupFunc { get; set; }
        public Func<IActionResult, bool> EvalFunc { get; set; }
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

        public static AutoSubstitute WithRegisteredHttpContext(this AutoSubstitute container, HttpContext context)
        {
            container.Provide(context);
            return container;
        }
        public static AutoSubstitute WithUrlFinder(this AutoSubstitute container)
        {
            var settings= container.Resolve<ISettings>();
            container.Provide<IRequestUrlFinderOuter>(new RequestUrlFinderOuter(container.Resolve<HttpContext>(), settings));
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
            return container.DoWithUpdate<IMozuSettings>(settings => settings.Domains.GetValue("login", "/login").Returns(loginPath));
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
            container.Provide<IList<IFilterMetadata>>(new List<IFilterMetadata>
            {
                new IgnoreDataViewModeAttribute()
            });
            return container;
        }
        public static AutoSubstitute WithoutIgnoreAttribute(this AutoSubstitute container)
        {
            container.Provide<IList<IFilterMetadata>>(new List<IFilterMetadata>());
            return container;
        }

        [DataViewModeEnforcement]
        public class MockTestController : ControllerBase
        {
            public Task<HttpResponseMessage> ExecuteAsync(ControllerContext controllerContext, CancellationToken cancellationToken)
            {
                throw new NotImplementedException();
            }
        }
    }
}
