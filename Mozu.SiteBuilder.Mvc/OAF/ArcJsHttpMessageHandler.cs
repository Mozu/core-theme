using Mozu.SiteBuilder.Mvc.ViewEngine;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.OAF
{
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


    //internal interface IArcJSHttpHandlerRunner
    //{
    //    Task<HttpResponseMessage> SendAsync(HttpConfiguration configuration, 
    //        IHttpRouteData routeData,
    //        HttpRequestMessage request, 
    //        string functionId , 
    //        CancellationToken cancellationToken);

    //    Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, 
    //       HttpResponseMessage response,
    //       string functionId,
    //       CancellationToken cancellationToken);
    //}

    // todo:cole add support for server side JS
    //class ArcJSHttpHandlerRunner : FunctionRunner<ApiActionExtensionFilterContext>, IArcJSHttpHandlerRunner , IResourceProvider
    //{
    //    private readonly IFunctionProvider _functionProvider;

    //    public ArcJSHttpHandlerRunner(IFunctionProvider functionProvider, ICacheManagerFactory cacheManagerFactory, IConfigurableLoggingService loggingService, ISecureAppDataWebApiClient secureAppDataWebApiClient, 
    //        ICredentialStoreRepository credentialStoreRepository, IApiContext apiContext, IManagerPool managerPool)
    //        : base(functionProvider, cacheManagerFactory, loggingService, secureAppDataWebApiClient, credentialStoreRepository, apiContext,
    //              managerPool )
    //    {
    //        _functionProvider = functionProvider;
    //    }




    //    public async Task<HttpResponseMessage> SendAsync(HttpConfiguration configuration, 
    //        IHttpRouteData routeData,
    //        HttpRequestMessage request, 
    //        string functionId , 
    //        CancellationToken cancellationToken)
    //    {

            
    //        var fn = await GetFunction(functionId).ConfigureAwait(false);
    //        if (fn == null)
    //        {
    //            throw new FunctionException("unable to find function  named " + functionId, null, null, System.Net.HttpStatusCode.NotFound, null);
    //        }

    //        var sbAEF = new SbActionExtensionFilter();
    //        var cctx = new HttpControllerContext(configuration, routeData, request);
    //        var desc = new ArcJSHttpActionDescriptor() { SettableActionName = functionId };
    //        var actionContext = new HttpActionContext(cctx, desc);



    //        var arcCtx = sbAEF.CreateFunctionContextExternal(actionContext);

    //        var handler = sbAEF.CreateHandler(actionContext);



    //        await this.RunFunctions(arcCtx, new List<CustomFunctionBase> { fn }, handler).ConfigureAwait(false);

    //        return actionContext.Response ?? request.CreateErrorResponse((HttpStatusCode)400, new HttpError("unhanded arcjs request"));
    //    }

    //    public Task<CustomFunctionBase> GetFunction(string id)
    //    {
    //        return _functionProvider.GetFunctions("http.storefront.routes").ContinueWith(task =>
    //        task.Result.FirstOrDefault(x => string.Equals(x.FunctionId, id, StringComparison.OrdinalIgnoreCase)));
    //    }

      
    //    Tuple<object, HttpStatusCode> IResourceProvider.GetResource(HttpActionContext ctx)
    //    {
    //        return new Tuple<object, HttpStatusCode>(null, HttpStatusCode.NotImplemented);
    //    }

    //    public async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, HttpResponseMessage response , string functionId, CancellationToken cancellationToken)
    //    {
    //        this.ActionId = functionId;
          
    //        if ((await this.EnsureFunctions().ConfigureAwait(false)) ==0 )
    //        {
    //            return response;
    //        }

    //        var sbAEF = new SbActionExtensionFilter();
    //        var cctx = new HttpControllerContext(request.GetConfiguration(), request.GetRouteData(), request);
    //        var desc = new ArcJSHttpActionDescriptor() { SettableActionName = functionId };
    //        var actionContext = new HttpActionContext(cctx, desc) { Response = response };
            


    //        var arcCtx = sbAEF.CreateFunctionContextExternal(actionContext);
    //        var handler = sbAEF.CreateHandler(actionContext);
    //        await this.ExecuteFunctions(arcCtx, handler);
    //        var obj = request.Resolve<NavigationContext>().Breadcrumbs;
    //        return actionContext.Response;
    //    }
    //}
}
