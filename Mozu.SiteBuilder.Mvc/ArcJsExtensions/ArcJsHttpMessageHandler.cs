using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using Mozu.Core;
using Mozu.Core.Actions;
using Mozu.Core.Actions.Contracts;
using Mozu.Core.Api.ErrorHandler;
using Mozu.Core.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.Core.Configuration;
using Microsoft.AspNetCore.Http;
using System.IO;
using Mozu.Core.Api.Client;
using Mozu.SiteBuilder.Mvc.Security;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using JsonSerializer = Newtonsoft.Json.JsonSerializer;
using Mozu.Core.Observability;

namespace Mozu.SiteBuilder.Mvc.OAF
{
    public class ArcJsHttpRouter : IRouter
    {
        public string FunctionId { get; set; }

        VirtualPathData IRouter.GetVirtualPath(VirtualPathContext context)
        {
            return new VirtualPathData(this, $"/arcjs/{FunctionId}");
        }

        Task IRouter.RouteAsync(RouteContext context)
        {
            context.Handler = httpContext =>
            {
                var handler = context.HttpContext.RequestServices.GetService<IArcJSHttpHandlerRunner>();
                return handler.RouteAsync(context, FunctionId);
            };
            return Task.CompletedTask;
        }
    }

    public class ArcJsRouteHandler
    {
        private readonly RouteContext _context;
        private readonly string _functionId;

        public ArcJsRouteHandler(RouteContext context, string functionId)
        {
            _context = context;
            _functionId = functionId;
        }

        public Task Route(HttpContext context)
        {
            var handler = context.RequestServices.GetService<IArcJSHttpHandlerRunner>();
            return handler.RouteAsync(_context, _functionId);
        }
    }


    internal interface IArcJSHttpHandlerRunner
    {
        Task RouteAsync(RouteContext context, string functionId);
    }

    class ArcJSHttpHandlerRunner : FunctionRunner<ApiActionExtensionFilterContext>, IArcJSHttpHandlerRunner
    {
        private readonly IFunctionProvider _functionProvider;

        public ArcJSHttpHandlerRunner(IFunctionProvider functionProvider, 
            ILoggerFactory loggingService,
            ISecureAppDataHandler secureAppDataHandler, 
            IApiContext apiContext, 
            NodePoolManager nodePoolManager,
            IMozuSettings mozuSettings, 
            IApiExceptionHandlerService apiExceptionHandlerService, 
            IHttpContextAccessor httpContextAccessor, 
            IObservabilityOptions observabilityOptions) : 
            base(functionProvider,
            loggingService, 
            secureAppDataHandler, 
            apiContext, 
            nodePoolManager, 
            mozuSettings, 
            apiExceptionHandlerService, 
            httpContextAccessor, 
            observabilityOptions)
        {
            _functionProvider = functionProvider;
        }

        async Task IArcJSHttpHandlerRunner.RouteAsync(RouteContext context, string functionId)
        {
            var fn = await GetFunction(functionId);
            if (fn == null)
            {
                context.HttpContext.Response.StatusCode = (int) HttpStatusCode.BadRequest;
                return;
            }

            var ctx = ApiActionExtensionFilterContextBuilder.Build(context, functionId);
            this.InitContext(ctx, null);
            await this.RunFunctions(ctx, new List<CustomFunctionBase> {fn},
                new FunctionCallbackhandler(context, functionId)).ConfigureAwait(false);
            var res = ctx.ActionContext.Result; //as ObjectResult;
            var loc = ctx.ActionContext.HttpContext.Response.Headers["Location"];

            if (res == null)
            {
                context.HttpContext.Response.StatusCode = context.HttpContext.Response.StatusCode == 200
                    ? 204
                    : context.HttpContext.Response.StatusCode;
                return;
            }

            await res.ExecuteResultAsync(ctx.ActionContext);
        }


        public Task<CustomFunctionBase> GetFunction(string id)
        {
            return _functionProvider.GetFunctions("http.storefront.routes").ContinueWith(
                (Task<IEnumerable<CustomFunctionBase>> task) =>
                    task.Result.FirstOrDefault(x =>
                        string.Equals(x.FunctionId, id, StringComparison.OrdinalIgnoreCase)));
        }
    }

    class FunctionCallbackhandler : IFunctionCallbackHandler
    {
        private readonly RouteContext _reouteContext;
        private readonly string _functionId;

        public FunctionCallbackhandler(RouteContext reouteContext, string functionId)
        {
            _reouteContext = reouteContext;
            _functionId = functionId;
        }

        FunctionContinuationBehavior IFunctionCallbackHandler.OnBeforeExecute(CustomFunctionBase function)
        {
            return FunctionContinuationBehavior.Continue;
        }

        FunctionContinuationBehavior IFunctionCallbackHandler.OnError(Exception ex, CustomFunctionBase function)
        {
            return FunctionContinuationBehavior.Continue;
        }

        Task IFunctionCallbackHandler.OnExe<T>(string key, object[] value, T context)
        {
            if (context.ExecDelegates != null && context.ExecDelegates.TryGetValue(key, out var fn))
            {
                return fn(value);
            }
            return Task.CompletedTask;
        }

        FunctionContinuationBehavior IFunctionCallbackHandler.OnResult(object result, CustomFunctionBase function,
            FunctionContextBase context)
        {
            return FunctionContinuationBehavior.Continue;
        }

        FunctionContinuationBehavior IFunctionCallbackHandler.OnTimeout(CustomFunctionBase function)
        {
            return FunctionContinuationBehavior.Continue;
        }
    }

    class ApiActionExtensionFilterContextBuilder
    {
        public static ApiActionExtensionFilterContext Build(RouteContext reouteContext, string functionId)
        {
            var apiContext = reouteContext.HttpContext.RequestServices.GetService<IApiContext>();

            var ac = new Microsoft.AspNetCore.Mvc.ActionContext()
            {
                HttpContext = reouteContext.HttpContext,
                ActionDescriptor = new Microsoft.AspNetCore.Mvc.Abstractions.ActionDescriptor(),
                RouteData = new RouteData()
            };
            var aec = new ActionExecutingContext(ac, new List<IFilterMetadata>(), new Dictionary<string, object>(),
                reouteContext);

            return SbApiActionExtensionFilter.InitSBActionContext(new ApiActionExtensionFilterContext(null, aec, null,
                (ctx =>
                {
                    var req = ctx.ActionContext.HttpContext.Request;
                    if (req.ContentLength.HasValue && req.ContentLength.Value > 0 && req.Body.CanRead)
                    {
                        var sr = new StreamReader(req.Body);
                        if (req.ContentType?.Contains("json") == true)
                        {
                            var jtr = new JsonTextReader(sr);
                            return JsonSerializer.CreateDefault().Deserialize(jtr);
                        }
                        else
                        {
                            return sr.ReadToEnd();
                        }
                    }

                    return null;
                })));
        }
    }

    public class SbActionExtensionFilterAttribute : ActionExtensionFilterAttribute
    {
        public SbActionExtensionFilterAttribute(string actionId, ActionExtensionExecutionTypes executionType,
            Type actionFilterType = null, Type resourceProviderType = null) : base(actionId, executionType,
            typeof(SbApiActionExtensionFilter), resourceProviderType)
        {
        }
    }

    public class SbApiActionExtensionFilter : ApiActionExtensionFilter
    {
        protected override ApiActionExtensionFilterContext CreateFunctionContext(ActionExecutingContext actionContext,
            ActionExecutedContext actionExecutedContext)
        {
            var ctx = base.CreateFunctionContext(actionContext, actionExecutedContext);
            InitSBActionContext(ctx);
            return ctx;
        }

        protected override IFunctionRunner<ApiActionExtensionFilterContext> CreateRunner(
            ActionExecutingContext actionContext)
        {
            var runner = base.CreateRunner(actionContext);
            return runner;
        }

        protected override bool ShouldContinueProcessing(ActionExecutingContext actionContext)
        {
            var ret = base.ShouldContinueProcessing(actionContext);
            return ret;
        }

        public override IFunctionCallbackHandler CreateHandler(ActionExecutingContext actionContext)
        {
            var handler = new FunctionCallbackHandler(actionContext);
            return handler;
        }

        class FunctionCallbackHandler : IFunctionCallbackHandler
        {
            private ActionExecutingContext _actionContext;

            public FunctionCallbackHandler(ActionExecutingContext actionContext)
            {
                _actionContext = actionContext;
            }

            FunctionContinuationBehavior IFunctionCallbackHandler.OnBeforeExecute(CustomFunctionBase function)
            {
                return FunctionContinuationBehavior.Continue;
            }

            FunctionContinuationBehavior IFunctionCallbackHandler.OnError(Exception ex, CustomFunctionBase function)
            {
                return FunctionContinuationBehavior.Continue;
            }

            Task IFunctionCallbackHandler.OnExe<T>(string key, object[] value, T context)
            {
                if (context.ExecDelegates!=null &&  context.ExecDelegates.TryGetValue(key, out var fn))
                {
                   return  fn(value);
                }
                return Task.CompletedTask;
            }

            FunctionContinuationBehavior IFunctionCallbackHandler.OnResult(object result, CustomFunctionBase function,
                FunctionContextBase context)
            {
                return FunctionContinuationBehavior.Continue;
            }

            FunctionContinuationBehavior IFunctionCallbackHandler.OnTimeout(CustomFunctionBase function)
            {
                return FunctionContinuationBehavior.Continue;
            }
        }


        public static ApiActionExtensionFilterContext InitSBActionContext(ApiActionExtensionFilterContext actionContext)
        {
            var services = actionContext.ActionContext.HttpContext.RequestServices;
            actionContext.GlobalContext ??= new Dictionary<string, GlobalContextItem>();
            actionContext.ExecDelegates ??= new Dictionary<string, Func<object[], Task>>();
            actionContext.Items ??= new Dictionary<string, object>();
            var sc = services.GetService<ISiteContext>();
            var pc = services.GetService<IPageContext>();
            var nc = services.GetService<NavigationContext>();
            actionContext.Items["pageContext"] = pc;
            actionContext.GlobalContext["siteContext"] = new GlobalContextItem() {Value = sc, Hash = sc.HashString};
            actionContext.GlobalContext["navigation"] = new GlobalContextItem() {Value = nc, Hash = sc.HashString};
            actionContext.ExecDelegates["loginUser"] = async objects =>
            {
                if (objects.Length == 0)
                {
                    return;
                }

                var authClient = services
                    .GetService<Mozu.Customer.Contracts.Clients.IAuthTicketWebApiClient>()
                    .CloneWithoutUserClaims();
                var authHelper = services.GetService<IAuthenticationHelper>();
                var pageContext = services.GetService<IPageContext>();
                var sbContext = services.GetService<ISiteBuilderApiContext>();
                var jarr = (JArray) objects[0];
                var jobj = (JObject)jarr[0];
                var customerId = (int) jobj["customerId"];
                var isB2B = jobj.ContainsKey("isB2B") ? (bool) jobj["isB2B"] : false;
                var userId = jobj.ContainsKey("userId") ? (string) jobj["userId"] : null;
                var rememberUser = jobj.ContainsKey("rememberUser") ? (bool?) jobj["rememberUser"] : (bool?) false;
                var authTicket = await (await authClient.CreateImpersonatedAuthTicket(customerId, userId)).ReadAsAsync();
                var cust = authTicket.CustomerAccount;
                var profile = new UserProfile()
                {
                    EmailAddress = cust.EmailAddress,
                    FirstName = cust.FirstName,
                    LastName = cust.LastName,
                    UserId = cust.UserId,
                    UserName = cust.UserName,
                };
                authHelper.SaveStoreFrontAccessToken(authTicket.AccessToken, profile.ToToken());
                var exp = (rememberUser == false) ? (DateTime?) null : authTicket.RefreshTokenExpiration;
                authHelper.SaveStoreFrontRefreshToken(authTicket.RefreshToken, exp);
                var userClaim = LightweightUserClaims.Parse(authTicket.AccessToken);
                sbContext.SetUser(userClaim);
            };

            actionContext.ExecDelegates["logOut"] = objects =>
            {
                var apiContext = services.Resolve<ISiteBuilderApiContext>();
                var authHelper = services.Resolve<IAuthenticationHelper>();
                var user = LightweightUserClaims.CreateForAnonymousShopper(apiContext.TenantId,
                    apiContext.SiteId.Value);
                authHelper.ClearStorefrontTokens();
                authHelper.SaveStoreFrontAccessToken(user.ToAccessToken(), null);
                apiContext.SetUser(user);
                return Task.CompletedTask;
            };

            return actionContext;
        }
    }
}