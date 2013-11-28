using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http.Hosting;
using System.Web.Http.Routing;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.Mvc.MessageHandler
{
    public class SeoDelegatingHandler : DelegatingHandler
    {
        protected async override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            var repo = request.Resolve<IRedirectRepository>();
            var redirects = await repo.FetchRedirectEntries();
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
                    var httpContextBase = (HttpContextBase)request.Properties["MS_HttpContext"];
                    var myHttpContext = new MyHttpContextBase(httpContextBase, url);

                    req.Properties["MS_HttpContext"] = myHttpContext;
                    myHttpContext.Items["MS_HttpRequestMessage"] = req;

                    #endregion

                    routeData = System.Web.Http.GlobalConfiguration.Configuration.Routes.GetRouteData(req);
                    if (routeData != null)
                    {
                        request.Properties[HttpPropertyKeys.HttpRouteDataKey] = routeData;
                    }
                }
                else
                {
                    HttpResponseMessage resp = request.CreateResponse(HttpStatusCode.MovedPermanently);
                    resp.Headers.Location = new Uri(redir.Destination, UriKind.RelativeOrAbsolute);
                    //var tcs = new TaskCompletionSource<HttpResponseMessage>();
                    //tcs.SetResult(resp);
                    return resp;
                }
            }
            return await base.SendAsync(request, cancellationToken);
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
