using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using Mozu.Core;
using Mozu.Core.Actions;
using Mozu.Core.Actions.Contracts;
using Mozu.Core.Api.ErrorHandler;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.Core.Configuration;

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
            var handler = context.HttpContext.RequestServices.GetService<IArcJSHttpHandlerRunner>();
            return handler.RouteAsync(context, FunctionId);
        }
    }
 
    //class ArcJSHttpHandler : HttpMessageHandler
    //{
    //    public string FunctionId { get; set; }
    //    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    //    {

    //        var runner = request.Resolve<IArcJSHttpHandlerRunner>();

    //        return runner.SendAsync(request.GetConfiguration(), request.GetRouteData(), request, FunctionId, cancellationToken);

    //    }
    //}
    //class ArcJSHttpActionDescriptor : HttpActionDescriptor
    //{
    //    Collection<HttpParameterDescriptor> col;
    //    public override Collection<HttpParameterDescriptor> GetParameters()
    //    {
    //        if (col == null)
    //        {
    //            col = new Collection<HttpParameterDescriptor>();
    //        }
    //        return col;
    //    }

    //    public override Task<object> ExecuteAsync(HttpControllerContext controllerContext, IDictionary<string, object> arguments, CancellationToken cancellationToken)
    //    {
    //        throw new NotImplementedException();
    //    }
    //    public string SettableActionName { get; set; }
    //    public override string ActionName { get { return SettableActionName; }  }
    //    public override Type ReturnType { get { return typeof(object); } }
    //}


    internal interface IArcJSHttpHandlerRunner
    {

        Task RouteAsync(RouteContext context, string functionId);

      
    }


    class ArcJSHttpHandlerRunner : FunctionRunner<ApiActionExtensionFilterContext>, IArcJSHttpHandlerRunner
    {
        private readonly IFunctionProvider _functionProvider;

        public ArcJSHttpHandlerRunner(IFunctionProvider functionProvider, ILoggerFactory loggingService, ISecureAppDataHandler secureAppDataHandler, IApiContext apiContext, NodePoolManager nodePoolManager, IMozuSettings mozuSettings, IApiExceptionHandlerService apiExceptionHandlerService) : base(functionProvider, loggingService, secureAppDataHandler, apiContext, nodePoolManager, mozuSettings, apiExceptionHandlerService)
        {
        }


        async Task IArcJSHttpHandlerRunner.RouteAsync(RouteContext context, string functionId)
        {
            var fn = await GetFunction(functionId);
            if ( fn == null)
            {
                context.HttpContext.Response.StatusCode =(int) HttpStatusCode.BadRequest;
                return;
            }
            var ctx = ApiActionExtensionFilterContextBuilder.Build(context, functionId);
            await this.RunFunctions(ctx, new List<CustomFunctionBase> { fn }, new FunctionCallbackhandler(context,functionId)).ConfigureAwait(false);
        }


        //public async Task<HttpResponseMessage> SendAsync(HttpConfiguration configuration,
        //    IHttpRouteData routeData,
        //    HttpRequestMessage request,
        //    string functionId,
        //    CancellationToken cancellationToken)
        //{


        //    var fn = await GetFunction(functionId).ConfigureAwait(false);
        //    if (fn == null)
        //    {
        //        throw new FunctionException("unable to find function  named " + functionId, null, null, System.Net.HttpStatusCode.NotFound, null);
        //    }

        //    var sbAEF = new SbActionExtensionFilter();
        //    var cctx = new HttpControllerContext(configuration, routeData, request);
        //    var desc = new ArcJSHttpActionDescriptor() { SettableActionName = functionId };
        //    var actionContext = new HttpActionContext(cctx, desc);



        //    var arcCtx = sbAEF.CreateFunctionContextExternal(actionContext);

        //    var handler = sbAEF.CreateHandler(actionContext);



        //    await this.RunFunctions(arcCtx, new List<CustomFunctionBase> { fn }, handler).ConfigureAwait(false);

        //    return actionContext.Response ?? request.CreateErrorResponse((HttpStatusCode)400, new HttpError("unhanded arcjs request"));
        //}

        public Task<CustomFunctionBase> GetFunction(string id)
        {
            return _functionProvider.GetFunctions("http.storefront.routes").ContinueWith((Task < IEnumerable < CustomFunctionBase >>  task) =>
            task.Result.FirstOrDefault(x => string.Equals(x.FunctionId, id, StringComparison.OrdinalIgnoreCase)));
        }


        //Tuple<object, HttpStatusCode> IResourceProvider.GetResource(HttpActionContext ctx)
        //{
        //    return new Tuple<object, HttpStatusCode>(null, HttpStatusCode.NotImplemented);
        //}

        //public async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, HttpResponseMessage response, string functionId, CancellationToken cancellationToken)
        //{
        //    this.ActionId = functionId;

        //    if ((await this.EnsureFunctions().ConfigureAwait(false)) == 0)
        //    {
        //        return response;
        //    }

        //    var sbAEF = new SbActionExtensionFilter();
        //    var cctx = new HttpControllerContext(request.GetConfiguration(), request.GetRouteData(), request);
        //    var desc = new ArcJSHttpActionDescriptor() { SettableActionName = functionId };
        //    var actionContext = new HttpActionContext(cctx, desc) { Response = response };



        //    var arcCtx = sbAEF.CreateFunctionContextExternal(actionContext);
        //    var handler = sbAEF.CreateHandler(actionContext);
        //    await this.ExecuteFunctions(arcCtx, handler);
        //    var obj = request.Resolve<NavigationContext>().Breadcrumbs;
        //    return actionContext.Response;
        //}

        //Tuple<object, HttpStatusCode> IResourceProvider.GetResource(ActionExecutingContext ctx)
        //{
        //    throw new NotImplementedException();
        //}
    }

    class FunctionCallbackhandler : IFunctionCallbackHandler
    {
        private readonly RouteContext _reouteContext;
        private readonly string _functionId;

        public FunctionCallbackhandler(RouteContext reouteContext, string functionId) {
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
            return Task.CompletedTask;
        }

        FunctionContinuationBehavior IFunctionCallbackHandler.OnResult(object result, CustomFunctionBase function, FunctionContextBase context)
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
        public static ApiActionExtensionFilterContext Build (RouteContext reouteContext , string functionId)
        {
            var apiContext = reouteContext.HttpContext.RequestServices.GetService<IApiContext>();

            var ac = new Microsoft.AspNetCore.Mvc.ActionContext() { HttpContext = reouteContext.HttpContext, ActionDescriptor = new Microsoft.AspNetCore.Mvc.Abstractions.ActionDescriptor(), RouteData = new RouteData() };
            var aec = new ActionExecutingContext(ac, new List<IFilterMetadata>(), new Dictionary<string, object>(), reouteContext);

            return new ApiActionExtensionFilterContext(null, aec, null);
        }
    }
    public class SbActionExtensionFilterAttribute : ActionExtensionFilterAttribute
    {
        public SbActionExtensionFilterAttribute(string actionId, ActionExtensionExecutionTypes executionType, Type actionFilterType = null, Type resourceProviderType = null) : base(actionId, executionType, typeof(SbApiActionExtensionFilter), resourceProviderType)
        {
        }
    }
    public class SbApiActionExtensionFilter: ApiActionExtensionFilter
    {
        
        protected override ApiActionExtensionFilterContext CreateFunctionContext(ActionExecutingContext actionContext, ActionExecutedContext actionExecutedContext)
        {
            var ctx =  base.CreateFunctionContext(actionContext, actionExecutedContext);
            InitSBActionContext(ctx);
            return ctx;
        }
        protected override IFunctionRunner<ApiActionExtensionFilterContext> CreateRunner(ActionExecutingContext actionContext)
        {
            var runner =  base.CreateRunner(actionContext);
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
                throw new NotImplementedException();
            }

            FunctionContinuationBehavior IFunctionCallbackHandler.OnResult(object result, CustomFunctionBase function, FunctionContextBase context)
            {
                return FunctionContinuationBehavior.Continue;
            }

            FunctionContinuationBehavior IFunctionCallbackHandler.OnTimeout(CustomFunctionBase function)
            {
                return FunctionContinuationBehavior.Continue;
            }
        }


        public static void InitSBActionContext(ApiActionExtensionFilterContext actionContext)
        {
            var services = actionContext.ActionContext.HttpContext.RequestServices;
            actionContext.Items = actionContext.Items ?? new Dictionary<string, object>();
            actionContext.Items["siteContext"] = services.GetService<ISiteContext>();
            actionContext.Items["pageContext"] = services.GetService<IPageContext>();
            actionContext.Items["navigation"] = services.GetService<NavigationContext>();
            //AddToActionContext<UrlHelper>(actionContext.Request, "urlHelper");
            //var routeData = new Microsoft.ClearScript.PropertyBag();
            //foreach (var kvp in actionContext.Request.GetRouteData().Values)
            //{
            //    routeData[kvp.Key] = kvp.Value;
            //}
            //AddToActionContext<Microsoft.ClearScript.PropertyBag>(actionContext.Request, "routeData", routeData);

            //var catTreeProvider = actionContext.Request.Resolve<ICategoryTreeProvider>();

            //if (catTreeProvider.HasCompleted)
            //{
            //    AddToActionContext<ICategoryTree>(actionContext.Request, "categoryHelper", catTreeProvider.GetAllCategories());
            //}
            //else
            //{
            //    AddToActionContext<ICategoryTree>(actionContext.Request, "categoryHelper", new CategoryHelper(catTreeProvider));
            //}
            return;
        }

    }
}
