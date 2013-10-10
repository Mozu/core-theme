using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
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
            if (this.CanWriteType(type))
            {
                var formatter = (HtmlActionResultMediaTypeFormatter)this.MemberwiseClone();
                formatter.RequestMessage = request;
                formatter.LifetimeScope = (ILifetimeScope)request.GetDependencyScope().GetService(typeof(ILifetimeScope));
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
                var sw = new StreamWriter(writeStream);
                return view.AsyncRender(hvc, sw).ContinueWith(x => sw.FlushAsync());


            }
            else
            {
                var action = value as ActionResult;


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
    }
    public class HtmlMediaTypeFormattingException : Exception
    {
        public HtmlMediaTypeFormattingException(Exception inner)
            : base("Bad", inner)
        {
        }

    }
}
