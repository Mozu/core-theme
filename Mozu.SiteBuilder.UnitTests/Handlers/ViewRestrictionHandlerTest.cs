//using Mozu.SiteBuilder.UnitTests.Utils;
//using NUnit.Framework;
//using AutofacContrib.NSubstitute;
//using Mozu.Core.Test;
//using Mozu.SiteBuilder.UX.MessageHandlers;
//using Should;
//using Mozu.SiteBuilder.Mvc.Contexts;
//using NSubstitute;
//using Mozu.SiteBuilder.Mvc.Security;
//using System;
//using System.Net.Http;
//using System.Collections.Generic;
//using System.Threading.Tasks;
//using Mozu.SiteBuilder.Mvc;
//using Mozu.Core;
//using Mozu.Core.Extensions;
//using Mozu.Core.Settings;
//using System.Threading;
//using System.Linq;
//using System.Net;

//namespace Mozu.SiteBuilder.UnitTests.Handlers
//{
//    [TestFixture]
//    [Category("Live/Pending permissions")]
//    public class ViewRestrictionHandlerTest :  UnitTestsFor<ViewRestrictionHandler>
//    {
//        [SetUp]
//        public void Clear()
//        {
//            MockContainer = new AutoSubstitute();
//        }

//        [Test, TestCaseSource("GetTests")]
//        public async Task DoTest(HandlerTest testcase)
//        {
//            var configuredContainer = MockContainer.WithLoginPath("http://mozu.com/login");
//            MockContainer = testcase.SetupFunc(configuredContainer);

//            InitObjectUnderTest();
//            ObjectUnderTest.InnerHandler = new EchoHandler();

//            var message = HttpRequestMessageHelpers.CreateFromContainer(MockContainer.Container);
//            message.RequestUri = new Uri(testcase.Route ?? "http://localhost/admin/test");
//            var response = await ObjectUnderTest.SendAsync(message);

//            testcase.EvalFunc(response).ShouldBeTrue(string.Format("assertion on case {0} failed", testcase.Name));
//        }

//        private static IEnumerable<HandlerTest> GetTests()
//        {
//            yield return new HandlerTest()
//            {
//                Name = "Shopper can't go through when pending locked down",
//                SetupFunc = mc => mc.WhenIsPendingRequest().WhenPendingIsLockedDown().WhenScopeIsShopper().WithSiteId(),
//                EvalFunc = msg => msg.StatusCode == System.Net.HttpStatusCode.Redirect
//            };
//            yield return new HandlerTest()
//            {
//                Name = "Shopper can't go through when live locked down",
//                SetupFunc = mc => mc.WhenIsLiveRequest().WhenLiveIsLockedDown().WhenScopeIsShopper().WithSiteId(),
//                EvalFunc = msg => msg.StatusCode == System.Net.HttpStatusCode.Redirect
//            };
//            yield return new HandlerTest()
//            {
//                Name = "Admin can go through when locked down and pending behavior",
//                SetupFunc = mc => mc.WhenIsPendingRequest().WhenPendingIsLockedDown().WhenScopeIsAdmin().WithPermission<Core.Behaviors.PublishPreviewBehavior>(),
//                EvalFunc = msg => msg.StatusCode == System.Net.HttpStatusCode.OK
//            };
//            yield return new HandlerTest()
//            {
//                Name = "Admin can't go through when locked down and no pending behavior",
//                SetupFunc = mc => mc.WhenIsPendingRequest().WhenPendingIsLockedDown().WhenScopeIsAdmin().WithoutPermission().WithSiteId(),
//                EvalFunc = msg => msg.StatusCode == System.Net.HttpStatusCode.Redirect
//            };
//            yield return new HandlerTest()
//            {
//                Name = "Admin can't go through when live locked down and no permission",
//                SetupFunc = mc => mc.WhenIsLiveRequest().WhenLiveIsLockedDown().WithoutPermission().WithSiteId(),
//                EvalFunc = msg => msg.StatusCode == System.Net.HttpStatusCode.Redirect
//            };
//            yield return new HandlerTest()
//            {
//                Name = "Admin can go through when live locked down and has permission",
//                SetupFunc = mc => mc.WhenIsLiveRequest().WhenLiveIsLockedDown().WhenScopeIsAdmin().WithPermission<Core.Behaviors.ViewLiveBehavior>(),
//                EvalFunc = msg => msg.StatusCode == System.Net.HttpStatusCode.OK
//            };
//            yield return new HandlerTest()
//            {
//                Name = "Admin can go through when live isn't locked down",
//                SetupFunc = mc => mc.WhenIsLiveRequest().WhenEverythingIsOpen().WhenScopeIsAdmin().WithPermission<Core.Behaviors.ViewLiveBehavior>(),
//                EvalFunc = msg => msg.StatusCode == System.Net.HttpStatusCode.OK
//            };
//            yield return new HandlerTest()
//            {
//                Name = "Shopper can go through when live isn't locked down",
//                SetupFunc = mc => mc.WhenIsLiveRequest().WhenEverythingIsOpen().WhenScopeIsShopper().WithPermission<Core.Behaviors.ViewLiveBehavior>(),
//                EvalFunc = msg => msg.StatusCode == System.Net.HttpStatusCode.OK
//            };

//            yield return new HandlerTest()
//            {
//                Name = "Requests to storefront pants go through all the time",
//                Route = "http://localhost/auth/pants",
//                SetupFunc = mc => mc.WhenIsPendingRequest().WhenPendingIsLockedDown().WhenScopeIsShopper(),
//                EvalFunc = msg => msg.StatusCode == System.Net.HttpStatusCode.OK
//            };
//            yield return new HandlerTest()
//            {
//                Name = "Unauth redirect has correct path",
//                SetupFunc = mc => mc.WhenIsLiveRequest().WhenLiveIsLockedDown().WhenScopeIsAdmin().WithSiteId(),
//                EvalFunc = msg => IsRedirectTo(msg, "login/unauthorized/index")
//            };
//            yield return new HandlerTest()
//            {
//                Name = "Login redirect has correct path",
//                SetupFunc = mc => mc.WhenIsLiveRequest().WhenLiveIsLockedDown().WhenScopeIsShopper().WithSiteId(),
//                EvalFunc = msg => IsRedirectTo(msg, "login/to")
//            };
//        }

//        static HttpStatusCode[] redirectCodes = new[] { HttpStatusCode.Redirect, HttpStatusCode.RedirectKeepVerb, HttpStatusCode.RedirectMethod, HttpStatusCode.TemporaryRedirect };
//        static bool IsRedirect(HttpResponseMessage msg)
//        {
//            return redirectCodes.Contains(msg.StatusCode);
//        }

//        static bool IsRedirectTo(HttpResponseMessage msg, string route)
//        {
//            return IsRedirect(msg) && msg.Headers.Location.AbsolutePath.Trim('/').EqualsIgnoreCase(route);
//        }

//        private class EchoHandler : DelegatingHandler
//        {
//            protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
//            {
//                return Task.FromResult(request.CreateResponse(System.Net.HttpStatusCode.OK));
//            }
//        }
//    }

//    public struct HandlerTest
//    {
//        public string Name { get; set; }
//        public string Route { get; set; }
//        public Func<AutoSubstitute, AutoSubstitute> SetupFunc { get; set; }
//        public Func<HttpResponseMessage, bool> EvalFunc { get; set; }
//        public override string ToString()
//        {
//            return Name;
//        }
//    }

//    public static class ContainerExtensions
//    {
//        public static AutoSubstitute WhenLiveIsLockedDown(this AutoSubstitute container)
//        {
//            return container.DoWithUpdate<ISiteContext>(ctx =>
//            {
//                if (ctx.GeneralSettings == null) ctx.GeneralSettings.Returns(new UX.Models.Settings.GeneralSettings());
//                var genSettings = ctx.GeneralSettings;
//                genSettings.IsRequiredLoginForLiveEnabled = true;
//            });
//        }

//        public static AutoSubstitute WhenPendingIsLockedDown(this AutoSubstitute container)
//        {
//            return container.DoWithUpdate<ISiteContext>(context => {
//                if (context.GeneralSettings == null) context.GeneralSettings.Returns(new UX.Models.Settings.GeneralSettings());
//                var genSettings = context.GeneralSettings;
//                genSettings.IsRequiredLoginForStagingEnabled = true;
//            });
//        }

//        public static AutoSubstitute WhenEverythingIsOpen(this AutoSubstitute container)
//        {
//            return container.DoWithUpdate<ISiteContext>(ctx => {
//                if (ctx.GeneralSettings == null) ctx.GeneralSettings.Returns(new UX.Models.Settings.GeneralSettings());
//                ctx.GeneralSettings.IsRequiredLoginForLiveEnabled = ctx.GeneralSettings.IsRequiredLoginForStagingEnabled = false;
//            });
//        }

//        public static AutoSubstitute WhenScopeIsShopper(this AutoSubstitute container)
//        {
//            // shopper scope means no admin token
//            return container.DoWithUpdate<IAuthenticationHelper>(h => h.GetAdminAccessToken().Returns(string.Empty));
//        }

//        public static AutoSubstitute WhenScopeIsAdmin(this AutoSubstitute container)
//        {
//            return container.DoWithUpdate<IAuthenticationHelper>(h => h.GetAdminAccessToken().Returns("yay I have a token"));
//        }
//        public static AutoSubstitute WithPermission<T>(this AutoSubstitute container) where T : Core.Behaviors.BehaviorDefinition, new()
//        {
//            return container.DoWithUpdate<IAuthenticationHelper>(ah => {
//                ah.GetAdminAccessToken().Returns(LightweightUserClaims.CreateForAdminUser("testuser", string.Empty, string.Empty, new int[] { new T().Id }, new UserScope(), DateTime.UtcNow.AddDays(7)).ToAccessToken());
//            }).DoWithUpdate<ISiteBuilderApiContext>(ctx => ctx.UserClaims.Returns(LightweightUserClaims.CreateForAnonymousShopper(10, 12)));
//        }
//        public static AutoSubstitute WithoutPermission(this AutoSubstitute container)
//        {
//            return container.DoWithUpdate<IAuthenticationHelper>(ah =>
//            {
//                ah.GetAdminAccessToken().Returns(LightweightUserClaims.CreateForAdminUser("testuser", string.Empty, string.Empty, new int[] { }, new UserScope(), DateTime.UtcNow.AddDays(7)).ToAccessToken());
//            }).DoWithUpdate<ISiteBuilderApiContext>(ctx => ctx.UserClaims.Returns(LightweightUserClaims.CreateForAnonymousShopper(10, 12)));
//        }

//        public static AutoSubstitute WhenIsPendingRequest(this AutoSubstitute container)
//        {
//            return container.WithDataViewMode(DataViewModeType.Pending);
//        }
//        public static AutoSubstitute WhenIsLiveRequest(this AutoSubstitute container)
//        {
//            return container.WithDataViewMode(DataViewModeType.Live);
//        }

//        public static AutoSubstitute WithDataViewMode(this AutoSubstitute container, DataViewModeType t)
//        {
//            return container.DoWithUpdate<ISiteBuilderApiContext>(ctx => ctx.DataViewMode.Returns(t));
//        }

//        public static AutoSubstitute WithSiteId(this AutoSubstitute container)
//        {
//            return container.DoWithUpdate<ISiteBuilderApiContext>(ctx => ctx.SiteId.Returns(1));
//        }

//        public static AutoSubstitute WithLoginPath(this AutoSubstitute container, string loginPath)
//        {
//            return container.DoWithUpdate<ISettings>(settings => settings.LoginPath.Returns(loginPath));
//        }

//        private static AutoSubstitute DoWithUpdate<T>(this AutoSubstitute container, Action<T> updater) where T : class
//        {
//            var i = container.Resolve<T>();
//            updater(i);
//            container.Provide(i);
//            return container;
//        }
//    }
//}
