using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using Microsoft.Net.Http.Headers;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Newtonsoft.Json;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.Core.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Mozu.SiteBuilder.Mvc.MediaTypeFormatters
{
    public class HtmlErrorMediaTypeHyperFormatter : OutputFormatter
    {
        public HtmlErrorMediaTypeHyperFormatter()
        {
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/html"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/json"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/json"));
        }
 

        void WriteYSOD(HttpContext context, Exception ex, Stream writeStream)
        {
            var stw = new StreamWriter(writeStream);
            stw.Write("<pre>");
            stw.Write(ex.ToString());

            var correlationId = context.RequestServices.Resolve<ISiteBuilderApiContext>().TraceContext.CorrelationId;
            var visist = context.RequestServices.GetService<PageContext>()?.Visit;
            stw.Write("</pre>");
            stw.WriteLine("<br>\r\ncorrelationId={0}", correlationId);
            stw.WriteLine("<br>\r\nvisistId={0}", visist == null ? "n/a": visist?.VisitId);

            stw.Flush();
        }

        protected override bool CanWriteType(Type type)
        {
            return type == typeof(ErrorCollection);
        }

        public override Task WriteResponseBodyAsync(OutputFormatterWriteContext context)
        {
            var tcs = new TaskCompletionSource<bool>();
            var value = context.Object;

            var ec = value as ErrorCollection;
            var ex = value is SiteBuilderErrorCollection collection ? collection.Exception : null;

            var model = ec;
            var showYSOD = context.HttpContext.RequestServices.Resolve<ISettings>().AppSettings("YSOD_ERRORS") == "true";
            object obj = null;

            if (ex != null && (showYSOD || context.HttpContext.GetRouteData().Values.TryGetValue("controller", out obj)))
            {
                if (showYSOD || string.Equals("resource", (string)obj, StringComparison.OrdinalIgnoreCase))
                {
                    WriteYSOD(context.HttpContext,ex, context.HttpContext.Response.Body);
                    tcs.SetResult(true);
                    return tcs.Task;
                }
            }

            var viewDataDictionary = new ViewDataDictionary<ErrorCollection>(null, model);

            var viewEngine = context.HttpContext.RequestServices.GetService<HyprViewEngine>();

            var sw = new StreamWriter(context.HttpContext.Response.Body);
            try
            {
                var view = viewEngine.FindPageView("error");

                return view.AsyncRender(new HyprViewContext(context.HttpContext, viewDataDictionary, null), sw).ContinueWith(_ =>
                {
                    if (!_.IsFaulted) return _;

                    if (ex != null)
                    {
                        WriteYSOD(context.HttpContext,ex, context.HttpContext.Response.Body);
                        tcs.SetResult(true);
                        return tcs.Task;
                    }

                    var jtw = new JsonTextWriter(new StreamWriter(context.HttpContext.Response.Body))
                    {
                        StringEscapeHandling = StringEscapeHandling.EscapeHtml, Formatting = Formatting.Indented
                    };
                    var ser = new JsonSerializer();
                    ser.Serialize(jtw, model);
                    jtw.Flush();

                    tcs.SetResult(true);
                    return tcs.Task;

                });
            }
            catch (Exception)
            {
                if (ex != null)
                {
                    WriteYSOD(context.HttpContext,ex, context.HttpContext.Response.Body);
                    tcs.SetResult(true);
                    return tcs.Task;
                }

                var jtw = new JsonTextWriter(new StreamWriter(context.HttpContext.Response.Body))
                {
                    Formatting = Formatting.Indented, StringEscapeHandling = StringEscapeHandling.EscapeHtml
                };
                context.HttpContext.Response.GetTypedHeaders().ContentType = new MediaTypeHeaderValue("text/json");
                var ser = new JsonSerializer();
                ser.Serialize(jtw, model);
                jtw.Flush();

                tcs.SetResult(true);
                return tcs.Task;
            }
        }
    }
}
