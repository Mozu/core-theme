using System;
using System.Diagnostics;
using System.IO;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;
using Autofac;
using Magnum.Extensions;
using MassTransit;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Logging;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Newtonsoft.Json;

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

        void WriteYSOD(Exception ex, Stream writeStream)
        {
            HttpException hex = ex as HttpException;
            if (hex == null)
            {
                hex = new HttpUnhandledException(ex.Message, ex);
            }

            var stw = new StreamWriter(writeStream);
            stw.Write(hex.GetHtmlErrorMessage());


            string correlationId = this.LifetimeScope.Resolve<ISiteBuilderApiContext>().TraceContext.CorrelationId;
            var visist = this.LifetimeScope.Resolve<PageContext>().Visit;

            stw.WriteLine("<br>\r\ncorrelationId={0}", correlationId);
            stw.WriteLine("<br>\r\nvisistId={0}", visist == null ? "n/a": visist.VisitId);


            stw.Flush();
            
        }

        private static string wrapperException = typeof (HtmlMediaTypeFormattingException).FullName;
        public override System.Threading.Tasks.Task WriteToStreamAsync(Type type, object value, Stream writeStream, System.Net.Http.HttpContent content, System.Net.TransportContext transportContext)
        {

            
            var tcs = new TaskCompletionSource<bool>();
            var tempModel = (System.Web.Http.HttpError)value;
            var model = tempModel;
            var showYSOD = this.RequestMessage.Resolve<ISettings>().AppSettings("YSOD_ERRORS") == "true";
            object obj;
            Exception ex = null;
            if (tempModel.TryGetValue("_ex", out obj))
            {
                ex = obj as Exception;
                tempModel.Remove("_ex");

                if ( showYSOD ||  this.RequestMessage.GetRouteData().Values.TryGetValue("controller",out obj))
                {
                    if (showYSOD || string.Equals("resource", (string)obj, StringComparison.OrdinalIgnoreCase))
                    {
                        WriteYSOD(ex, writeStream);
                        tcs.SetResult(true);
                        return tcs.Task;
                    }
                }
                

            }
           



            var innerException = model;
            while (true)
            {
                
                if (tempModel.TryGetValue("InnerException", out obj))
                {
                    tempModel = (System.Web.Http.HttpError)obj;
                    var exType = tempModel["ExceptionType"] as string;
                    if (exType == wrapperException)
                    {
                        model = (System.Web.Http.HttpError) tempModel["InnerException"];
                        break;
                        
                    }else if (exType != null && exType.StartsWith("NDjango"))
                    {
                        model = tempModel;
                        break;
                    }

                    
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

           
            var sw = new StreamWriter(writeStream);
            try
            {
                var view = viewEngine.FindPageView("error");



                return view.AsyncRender(new HyprViewContext(this.RequestMessage, viewDataDictionary, null), sw).ContinueWith(_ =>
                {
                    if (_.IsFaulted)
                    {
                       
                        if (ex != null)
                        {
                            WriteYSOD(ex, writeStream);
                            tcs.SetResult(true);
                            return tcs.Task;
                        }

                        var jtw = new JsonTextWriter(new StreamWriter(writeStream));
                        jtw.StringEscapeHandling = StringEscapeHandling.EscapeHtml;
                        jtw.Formatting = Formatting.Indented;
                        var ser = new JsonSerializer();
                        ser.Serialize(jtw, model);
                        jtw.Flush();
                       
                        tcs.SetResult(true);
                        return tcs.Task;
                    }
                    else
                    {
                        return _;
                    }
                });
            }
            catch (Exception)
            {
              
                if (ex != null)
                {
                    WriteYSOD(ex, writeStream);
                    tcs.SetResult(true);
                    return tcs.Task;
                }
                var jtw = new JsonTextWriter(new StreamWriter(writeStream));
                jtw.Formatting = Formatting.Indented;
                jtw.StringEscapeHandling = StringEscapeHandling.EscapeHtml;
                content.Headers.ContentType = new MediaTypeHeaderValue("text/json");
                var ser = new JsonSerializer();
                ser.Serialize(jtw, model);
                jtw.Flush();
               
                tcs.SetResult(true);
                return tcs.Task;
            }
            

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
