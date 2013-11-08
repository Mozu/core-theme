using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Autofac;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.MediaTypeFormatters
{
    public class HtmlActionResultMediaTypeFormatter : MediaTypeFormatter
    {
       

        public HtmlActionResultMediaTypeFormatter()
        {
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/html"));
        }
        private ILifetimeScope LifetimeScope { get; set; }
        public override MediaTypeFormatter GetPerRequestFormatterInstance(Type type, System.Net.Http.HttpRequestMessage request, MediaTypeHeaderValue mediaType)
        {
            var apiContext = request.Resolve<ISiteBuilderApiContext>();
            if (apiContext.SiteId == null && type.IsAssignableTo<IHyprViewResult>())
            {
                return System.Web.Http.GlobalConfiguration.Configuration.Formatters.JsonFormatter;
            }
            if (this.CanWriteType(type))
            {
                var formatter = (HtmlActionResultMediaTypeFormatter)this.MemberwiseClone();
                formatter.RequestMessage = request;
                formatter.LifetimeScope = (ILifetimeScope)request.GetDependencyScope().GetService(typeof(ILifetimeScope));
                formatter.MediaType = mediaType;
                return formatter;
            }
            return this;

        }

        public override Task WriteToStreamAsync(Type type, object value, Stream writeStream, System.Net.Http.HttpContent content, System.Net.TransportContext transportContext)
        {
            var vrb = value as ViewResultBase;

            if (vrb != null && vrb is IHyprViewResult)
            {
                
                var viewEngine = this.RequestMessage.Resolve<HyprViewEngine>();
                var view = viewEngine.FindPageView(vrb.ViewName);
                var hvc = new HyprViewContext(this.RequestMessage, vrb.ViewData, null);
                var httpContext = this.RequestMessage.HttpContext();
                httpContext.Response.Buffer = true;
                var sw = new StreamWriter(writeStream);
                //view.Render(hvc, sw );
                //var tsc2 = new TaskCompletionSource<bool>();
                //tsc2.SetResult(true);
                //return tsc2.Task;
                if (view == null)
                {
                    throw new FileNotFoundException("cant find view " + vrb.ViewName);
                }
                return view.AsyncRender(hvc, sw);
            }
            else
            {
                var action = value as ActionResult;
                var iAsyncActoin = value as IActionResultAsync;
                if (iAsyncActoin != null)
                {
                    return iAsyncActoin.ExecuteResultAsync(this.RequestMessage);
                }

                var tsc = new TaskCompletionSource<bool>();
                try
                {
                    action.ExecuteResult(this.RequestMessage);
                    tsc.SetResult(false);
                }
                catch (Exception ex)
                {
                    tsc.SetException(new HtmlMediaTypeFormattingException(ex));
                  
                }
               
                
                return tsc.Task;
            }
        }

        public override bool CanReadType(Type type)
        {
            return false;
        }

        public override bool CanWriteType(Type type)
        {
            return typeof(ActionResult).IsAssignableFrom(type);

        }

        public HttpRequestMessage RequestMessage { get; set; }

        public MediaTypeHeaderValue MediaType { get; set; }
    }
    public class HtmlMediaTypeFormattingException : Exception
    {
        public HtmlMediaTypeFormattingException(Exception inner)
            : base("Bad", inner)
        {
        }

    }
}
