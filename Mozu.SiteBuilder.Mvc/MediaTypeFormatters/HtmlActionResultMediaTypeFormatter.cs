using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using Microsoft.AspNetCore.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using Microsoft.Net.Http.Headers;
using MongoDB.Driver.Core.WireProtocol.Messages;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Configuration;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Logging;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.MediaTypeFormatters
{
    public class HtmlActionResultMediaTypeFormatter : OutputFormatter
    {
        private readonly ILogger _logger = LoggingService.LoggerFor<HtmlActionResultMediaTypeFormatter>();
        HtmlErrorMediaTypeHyperFormatter _errorMediaTypeHyperFormatter = new HtmlErrorMediaTypeHyperFormatter();
        public HtmlActionResultMediaTypeFormatter()
        {
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/html"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/json"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/json"));
        }

        public HttpContext HttpContext { get; set; }

        private Exception CreateandLogFormattingException(Exception ex, OutputFormatterWriteContext context)
        {
            _logger.Error("An unhandled exception occured in the HtmlActionResultMediaTypeFormatter.", ex);

            var statusCode = HttpStatusCode.InternalServerError;
            context.HttpContext.GetRouteData().Values.TryGetValue("controller", out var controller);
            var headers = context.HttpContext.Request.GetTypedHeaders();

            if (string.Equals((string)controller,"resource",StringComparison.OrdinalIgnoreCase)||
                context.Object != null && 
                headers.ContentType != null && 
                headers.ContentType.MediaType.HasValue && 
                !string.IsNullOrEmpty(headers.ContentType.MediaType.Value) && 
                !string.Equals(headers.ContentType.MediaType.Value, "text/html"))
            {
                //pushes thru the rp.
                statusCode = HttpStatusCode.UnsupportedMediaType;
            }

            ex = Unwrap(ex);

            var errorResp = new ActionFilters.HttpResponseException( ex, ex.Message,(int) statusCode);

            return errorResp;
        }

        static Exception Unwrap(Exception ex)
        {
            while (ex is AggregateException agg && agg.InnerExceptions.Count == 1)
            {
                ex = agg.InnerException;
            }
            return ex;
        }

        private static void InitAdditioanViewContext (HyprViewContext context)
        {
            var apiContext = context.HttpContext.RequestServices.Resolve<ISiteBuilderApiContext>();

            context.ViewData["priceListCode"] = apiContext.PriceListCode;
        }

        protected override bool CanWriteType(Type type)
        {
            return typeof(IActionResult).IsAssignableFrom(type);
        }

        public async override Task WriteResponseBodyAsync(OutputFormatterWriteContext context)
        {
            try
            {
                await WriteResponseBodyAsyncInternal(context);
            }
            catch (Exception e)
            {
                var ec = new SiteBuilderErrorCollection() {Exception = e};
                context = new OutputFormatterWriteContext(context.HttpContext, writerFactory:context.WriterFactory, typeof(ErrorCollection), ec);
                await _errorMediaTypeHyperFormatter.WriteResponseBodyAsync(context);
            }
            
        }

        public  Task WriteResponseBodyAsyncInternal(OutputFormatterWriteContext context)
        {
            if (context.Object is ViewResultBase vrb && vrb is IHyprViewResult)
            {
                var viewEngine = context.HttpContext.RequestServices.Resolve<HyprViewEngine>();

                if (context.HttpContext.Request.Headers.TryGetValue(Constants.HEADER_ALTERNATIVE_VIEW, out var values) && values.Any(x => !string.IsNullOrWhiteSpace(x)))
                {
                    vrb.View = viewEngine.FindPageView(values.First());
                }

                var view = vrb.View ?? viewEngine.FindPageView(vrb.ViewName);
                var httpContext = context.HttpContext;
                var hvc = new HyprViewContext(httpContext, vrb.ViewData, null);
                InitAdditioanViewContext(hvc);
                //httpContext.Response.Buffer = true;
                var sw = new StreamWriter(httpContext.Response.Body);

                if (view == null)
                {
                    throw CreateandLogFormattingException(new FileNotFoundException("cant find view " + vrb.ViewName), context);
                }
                return view.AsyncRender(hvc, sw).ContinueWith(_ =>
                {
                    if (_.IsFaulted)
                    {
                        throw CreateandLogFormattingException(_.Exception, context);
                    }
                    return _.Result;
                });
            }

            var actionContext = new ActionContext(context.HttpContext, context.HttpContext.GetRouteData(), new ActionDescriptor());

            if (context.Object is ActionResult && context.Object is IActionResult iAsyncActoin)
            {
                var task = iAsyncActoin.ExecuteResultAsync(actionContext);

                return task.ContinueWith(_ =>
                {
                    if (_.IsFaulted)
                    {
                        throw CreateandLogFormattingException(_.Exception, context);
                    }
                    return _;
                }, TaskContinuationOptions.ExecuteSynchronously);
            }

            var tsc = new TaskCompletionSource<bool>();

            try
            {
                ((ActionResult)context.Object).ExecuteResult(actionContext);
                tsc.SetResult(false);
            }
            catch (Exception ex)
            {
                tsc.SetException(CreateandLogFormattingException(ex, context));
            }

            return tsc.Task;
        }
    }
    public class HtmlMediaTypeFormattingException : Exception
    {
        public HtmlMediaTypeFormattingException(Exception inner)
            : base("Bad", inner)
        {
        }
    }
}
