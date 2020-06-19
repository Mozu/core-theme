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
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Text.Json;
using Newtonsoft.Json;
//using System.Text.Json;
using Newtonsoft.Json.Linq;
using JsonSerializer = Newtonsoft.Json.JsonSerializer;

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

        public ArcJsRouteHandler  (RouteContext context , string functionId)
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
            _functionProvider = functionProvider;
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
            var res = ctx.ActionContext.Result ;//as ObjectResult;
            var loc = ctx.ActionContext.HttpContext.Response.Headers["Location"];
            
            if (res == null )
            {
                context.HttpContext.Response.StatusCode = context.HttpContext.Response.StatusCode == 200
                    ? 418
                    : context.HttpContext.Response.StatusCode;
                return;
            }
            await res.ExecuteResultAsync(ctx.ActionContext);
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

            return SbApiActionExtensionFilter.InitSBActionContext(new ApiActionExtensionFilterContext(null, aec, null, (ctx =>
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

        class MyStream : Stream
        {
            public Stream InnerStream;

            public override bool CanRead =>  false;

            public override bool CanSeek => false;

            public override bool CanWrite => true;

            public override long Length => throw new NotImplementedException();

            public override long Position { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

            public override void Flush()
            {
                InnerStream.Flush();
            }

            public override int Read(byte[] buffer, int offset, int count)
            {
                throw new NotImplementedException();
            }

            public override long Seek(long offset, SeekOrigin origin)
            {
                throw new NotImplementedException();
            }

            public override void SetLength(long value)
            {
                throw new NotImplementedException();
            }

            public override void Write(byte[] buffer, int offset, int count)
            {
                var txt = System.Text.Encoding.UTF8.GetString(buffer, offset, count);
                System.Diagnostics.Debug.WriteLine(txt);
                InnerStream.Write(buffer, offset, count);
            }
        }
   

        public static ApiActionExtensionFilterContext InitSBActionContext(ApiActionExtensionFilterContext actionContext)
        {
            var services = actionContext.ActionContext.HttpContext.RequestServices;
            actionContext.GlobalContext = actionContext.GlobalContext ?? new Dictionary<string, GlobalContextItem>();
            actionContext.Items = actionContext.Items ?? new Dictionary<string, object>();
            var sc = services.GetService<ISiteContext>();
            var pc = services.GetService<IPageContext>();
            var nc = services.GetService<NavigationContext>();

            actionContext.Items["pageContext"] = pc;

            //var ms = new MemoryStream();
            //var my = new MyStream() { InnerStream = ms };
            //var writer = new System.Text.Json.Utf8JsonWriter(my, new System.Text.Json.JsonWriterOptions() { });
            //var opts = new System.Text.Json.JsonSerializerOptions()
            //{
            //    MaxDepth = 10000
            //};
            //opts.Converters.Add(new JObjectTypeConverter());
            //opts.Converters.Add(new JArrayTypeConverter());
            //opts.Converters.Add(new MyJsonConverter());
            //System.Text.Json.JsonSerializer.Serialize(writer, sc, sc.GetType(), opts);

            actionContext.GlobalContext["siteContext"] = new GlobalContextItem() { Value = sc, Hash = sc.HashString };         
            actionContext.GlobalContext["navigation"] = new GlobalContextItem() { Value = nc, Hash = sc.HashString };
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
            return actionContext;
        }

    }
}
