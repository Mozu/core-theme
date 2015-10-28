using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Routing;
using Mozu.Core;
using Mozu.Core.Actions;
using Mozu.Core.Actions.Contracts;
using Mozu.Core.Actions.Contracts.Cache;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using NDjango.Interfaces;

namespace Mozu.SiteBuilder.Mvc.OAF
{
    class ArcJSHttpHandler : HttpMessageHandler
    {
        public string FunctionId { get; set; }
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {

            var runner = request.Resolve<IArcJSHttpHandlerRunner>();

            return runner.SendAsync(request.GetConfiguration(), request.GetRouteData(), request, FunctionId, cancellationToken);

        }
    }
    class ArcJSHttpActionDescriptor : HttpActionDescriptor
    {
        Collection<HttpParameterDescriptor> col;
        public override Collection<HttpParameterDescriptor> GetParameters()
        {
            if (col == null)
            {
                col = new Collection<HttpParameterDescriptor>();
            }
            return col;
        }

        public override Task<object> ExecuteAsync(HttpControllerContext controllerContext, IDictionary<string, object> arguments, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
        public string SettableActionName { get; set; }
        public override string ActionName { get { return SettableActionName; }  }
        public override Type ReturnType { get { return typeof(object); } }
    }


    internal interface IArcJSHttpHandlerRunner
    {
        Task<HttpResponseMessage> SendAsync(HttpConfiguration configuration, 
            IHttpRouteData routeData,
            HttpRequestMessage request, 
            string functionId , 
            CancellationToken cancellationToken);
    }

    class ArcJSHttpHandlerRunner : FunctionRunner<ApiActionExtensionFilterContext>, IArcJSHttpHandlerRunner , IResourceProvider
    {
        private readonly IFunctionProvider _functionProvider;

        public ArcJSHttpHandlerRunner(IFunctionProvider functionProvider, ICacheManagerFactory cacheManagerFactory, IConfigurableLoggingService loggingService, IApiContext apiContext) : base(functionProvider, cacheManagerFactory, loggingService, apiContext)
        {
            _functionProvider = functionProvider;
        }



       
        public async Task<HttpResponseMessage> SendAsync(HttpConfiguration configuration, 
            IHttpRouteData routeData,
            HttpRequestMessage request, 
            string functionId , 
            CancellationToken cancellationToken)
        {

            
            var fn = await GetFunction(functionId).ConfigureAwait(false);
            if (fn == null)
            {
                throw new FunctionException("unable to find function  named " + functionId, null, null, System.Net.HttpStatusCode.NotFound, null);
            }


            var cctx = new HttpControllerContext(configuration, routeData, request);
            var desc = new ArcJSHttpActionDescriptor() { SettableActionName = functionId };
            var actionContext = new HttpActionContext(cctx, desc);
            var arcCtx = new ApiActionExtensionFilterContext(this, actionContext);


            var handler = new WrappedFunctionCallbackHandler(DefaultFunctionCallbackHandler.Default)
            {
               
            };
            await this.RunFunctions(arcCtx, new List<CustomFunctionBase> { fn }, handler).ConfigureAwait(false);

            return actionContext.Response;
        }

        public Task<CustomFunctionBase> GetFunction(string id)
        {
            return _functionProvider.GetFunctions("http.storefront.routes").ContinueWith(task =>
            task.Result.FirstOrDefault(x => string.Equals(x.FunctionId, id, StringComparison.OrdinalIgnoreCase)));
        }


        Tuple<object, HttpStatusCode> IResourceProvider.GetResource(HttpActionContext ctx)
        {
            return new Tuple<object, HttpStatusCode>(null, HttpStatusCode.NotImplemented);
        }
    }
}
