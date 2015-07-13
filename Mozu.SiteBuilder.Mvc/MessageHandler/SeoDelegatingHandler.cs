using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http.Hosting;
using System.Web.Http.Routing;
using Autofac;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.Mvc.MessageHandler
{
    public class SeoDelegatingHandler : DelegatingHandler
    {
        public static bool IsSeoRewrite(HttpRequestMessage msg)
        {
             object isRedirectFlag;
            return  msg.Properties.TryGetValue("isSeoRewrite", out isRedirectFlag) && (bool) isRedirectFlag ;
        }
        protected async override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            var httpContextBase = (HttpContextBase)request.Properties["MS_HttpContext"];

            var apiContext = request.Resolve<ISiteBuilderApiContext>();

            if (apiContext.SiteId.HasValue == false)
            {
                return (await base.SendAsync(request, cancellationToken).ConfigureAwait(false));
            }


            var repo = request.Resolve<IRedirectRepository>();
            var redirects = await repo.FetchRedirectEntries().ConfigureAwait(false);
            string stem = request.RequestUri.AbsolutePath;
            stem = stem.Length > 0 && stem[0] == '/' ? stem.Substring(1) : stem;
            RedirectEntry redir;
            IHttpRouteData routeData = null;
            if (redirects.TryGetValue(stem, out redir))
            {
                if (redir.IsRewrite.GetValueOrDefault(false))
                {
                    string url = "~/" + redir.Destination;

                    var ub = new UriBuilder();
                    ub.Host = "localhost";
                    ub.Path = redir.Destination; ;

                    
                    #region magicstrings

                    var req = new HttpRequestMessage(HttpMethod.Get, ub.Uri);
                    //magic strings taken from decompiled source :(
                    
                    
                    var myHttpContext = new MyHttpContextBase(httpContextBase, url);

                    req.Properties["MS_HttpContext"] = myHttpContext;
                    myHttpContext.Items["MS_HttpRequestMessage"] = req;

                    #endregion

                    routeData = System.Web.Http.GlobalConfiguration.Configuration.Routes.GetRouteData(req);
                    if (routeData != null)
                    {
                        request.Properties[HttpPropertyKeys.HttpRouteDataKey] = routeData;
                    }
                    request.Properties["isSeoRewrite"] = true;
                    var rctx = request.GetRequestContext();
                    rctx.RouteData = routeData;
                     
                }
                else if ( !apiContext.IsEditMode )
                {
                    HttpResponseMessage resp = request.CreateResponse(HttpStatusCode.MovedPermanently);
                    var uri = new Uri(redir.Destination, UriKind.RelativeOrAbsolute);
                    if (!uri.IsAbsoluteUri && !string.IsNullOrEmpty(redir.Destination) && redir.Destination[0] != '/')
                    {
                        uri = new Uri("/"+ redir.Destination, UriKind.RelativeOrAbsolute);
                    }
                    resp.Headers.Location = uri;
                    //var tcs = new TaskCompletionSource<HttpResponseMessage>();
                    //tcs.SetResult(resp);
                    return resp;
                }
            }

            if (  request.GetRouteData().Route is Mozu.SiteBuilder.Mvc.SEO.NonSystemRoute)
            {
                var routeHandler = request.Resolve<ICustomRouteHandler>();
                var found = await routeHandler.RouteIncomingRequest().ConfigureAwait(false);
                if ( !found)
                {
                    request.Resolve<IRouteConfig>().RouteIncomingRequest(request);
                }
            }



            var response = await base.SendAsync(request, cancellationToken).ConfigureAwait(false);

            
            return response;



        }

       

        private class MyHttpContextBase : HttpContextBase
        {
            private readonly IDictionary _items;
            private HttpContextBase httpContext;

            public MyHttpContextBase(HttpContextBase httpContext, string pathInfo)
            {
                // TODO: Complete member initialization
                _items = new Hashtable();
                this.httpContext = httpContext;
                MyRequest = new MyHttpRequestBase(this.httpContext.Request, pathInfo);
            }

            public override IDictionary Items
            {
                get { return _items; }
            }

            public override HttpRequestBase Request
            {
                get { return MyRequest; }
            }

            private HttpRequestBase MyRequest { get; set; }
        }

        private class MyHttpRequestBase : HttpRequestBase
        {
            private readonly string _appRelativeCurrentExecutionFilePath;
            private HttpRequestBase _httpRequestBase;

            public MyHttpRequestBase(HttpRequestBase httpRequestBase, string appRelativeCurrentExecutionFilePath)
            {
                // TODO: Complete member initialization
                _httpRequestBase = httpRequestBase;
                _appRelativeCurrentExecutionFilePath = appRelativeCurrentExecutionFilePath;
            }

            public override string AppRelativeCurrentExecutionFilePath
            {
                get { return _appRelativeCurrentExecutionFilePath; }
            }

            public override string PathInfo
            {
                get { return ""; }
            }
        }
    }
}
