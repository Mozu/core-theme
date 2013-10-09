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
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.MediaTypeFormatters
{
    public class HtmlErrorMediaTypeHyperFormatter : MediaTypeFormatter
    {
        public HtmlErrorMediaTypeHyperFormatter()
        {
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/html"));
        }
        public ILifetimeScope LifetimeScope { get; set; }
        public override MediaTypeFormatter GetPerRequestFormatterInstance(Type type, System.Net.Http.HttpRequestMessage request, MediaTypeHeaderValue mediaType)
        {
            if (this.CanWriteType(type))
            {
                var formatter = (HtmlErrorMediaTypeHyperFormatter)this.MemberwiseClone();
                formatter.RequestMessage = request;
                formatter.LifetimeScope = (ILifetimeScope)request.GetDependencyScope().GetService(typeof(ILifetimeScope));
                return formatter;
            }
            return this;

        }



        public override System.Threading.Tasks.Task WriteToStreamAsync(Type type, object value, Stream writeStream, System.Net.Http.HttpContent content, System.Net.TransportContext transportContext)
        {



            var model = (System.Web.Http.HttpError)value;

            var innerException = model;
            while (true)
            {
                object obj;
                if (model.TryGetValue("InnerException", out obj))
                {
                    model = (System.Web.Http.HttpError)obj;
                }
                else
                {
                    break;
                }
            }







            var viewDataDictionary = new ViewDataDictionary()
            {
                Model = model
            };


            var viewEngine = LifetimeScope.Resolve<HyprViewEngine>();




            var view = viewEngine.FindPageView("error");

            var sw = new StreamWriter(writeStream);

            return view.AsyncRender(new HyprViewContext(this.RequestMessage, viewDataDictionary, null), sw).ContinueWith(x => sw.FlushAsync());

        }

        public override bool CanReadType(Type type)
        {
            return false;
        }

        public override bool CanWriteType(Type type)
        {
            return type == typeof(System.Web.Http.HttpError);
        }

        public HttpRequestMessage RequestMessage { get; set; }
    }


}
