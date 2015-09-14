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
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Logging;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.MediaTypeFormatters
{
    public class HtmlActionResultMediaTypeFormatter : MediaTypeFormatter
    {
       

        public HtmlActionResultMediaTypeFormatter()
        {
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/json"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/json"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/html"));
        }
        private ILifetimeScope LifetimeScope { get; set; }
        private ILogger _logger;
        private string _correlationId;

    

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

                var exceptionLogWrapper = formatter.LifetimeScope.Resolve<ExceptionContextLogWrapper>();
                formatter._logger = exceptionLogWrapper.GetLogger();
                formatter._correlationId = exceptionLogWrapper.GetCorrelationId();

                return formatter;
            }
            return this;

        }

        private HttpResponseException CreateandLogFormattingException(Exception ex, System.Net.Http.HttpContent content)
        {
            _logger.Error("An unhandled exception occured in the HtmlActionResultMediaTypeFormatter.", ex);


            HttpStatusCode statusCode = HttpStatusCode.InternalServerError;
            object controller;
            this.RequestMessage.GetRouteData().Values.TryGetValue("controller", out controller);



            if (string.Equals((string)controller,"resource",StringComparison.OrdinalIgnoreCase)||
                (content != null
             && content.Headers.ContentType != null
             && !string.IsNullOrEmpty(content.Headers.ContentType.MediaType)
             && !string.Equals(content.Headers.ContentType.MediaType, "text/html")))
            {
                //pushes thru the rp.
                statusCode = HttpStatusCode.UnsupportedMediaType;
            }


       
            AggregateException aggregateException = ex as AggregateException;
            if (aggregateException != null && aggregateException.InnerExceptions.Count ==1)
            {
                ex = aggregateException.InnerExceptions.First();
            }

            var errorResp = this.RequestMessage.CreateErrorResponse(statusCode, ex);

            ((HttpError) ((ObjectContent) errorResp.Content).Value)["_ex"] = ex;
            return new HttpResponseException(errorResp);
        }

        public override Task WriteToStreamAsync(Type type, object value, Stream writeStream, System.Net.Http.HttpContent content, System.Net.TransportContext transportContext)
        {
            var vrb = value as ViewResultBase;

            if (vrb != null && vrb is IHyprViewResult)
            {
                
                var viewEngine = this.RequestMessage.Resolve<HyprViewEngine>();

                IEnumerable<string> values;
                if ( this.RequestMessage.Headers.TryGetValues(Constants.HEADER_ALTERNATIVE_VIEW, out values) && values.Any(x => !string.IsNullOrWhiteSpace(x)))
                {
                    vrb.View = viewEngine.FindPageView(values.First());
                }
                

                var view = vrb.View ?? viewEngine.FindPageView(vrb.ViewName);
                var hvc = new HyprViewContext(this.RequestMessage, vrb.ViewData, null);
                var httpContext = this.RequestMessage.HttpContext();
                httpContext.Response.Buffer = true;
                var sw = new StreamWriter(writeStream);
            
                if (view == null)
                {
                    throw CreateandLogFormattingException(new FileNotFoundException("cant find view " + vrb.ViewName), content);
                }
                return view.AsyncRender(hvc, sw).ContinueWith(_ =>
                {
                    if (_.IsFaulted)
                    {
                        throw CreateandLogFormattingException(_.Exception, content);
                    }
                    return _.Result;
                });
            }
            else
            {
                var action = value as ActionResult;
                var iAsyncActoin = value as IActionResultAsync;
                if (iAsyncActoin != null)
                {
                    var task = iAsyncActoin.ExecuteResultAsync(this.RequestMessage);

                    return task.ContinueWith(_ =>
                    {
                        if (_.IsFaulted)
                        {
                            throw CreateandLogFormattingException(_.Exception, content);

                        }
                        return _;
                    }, TaskContinuationOptions.ExecuteSynchronously);
                    //return task;
                }
                else
                {
                    var tsc = new TaskCompletionSource<bool>();
                    try
                    {
                        action.ExecuteResult(this.RequestMessage);
                        tsc.SetResult(false);
                    }
                    catch (Exception ex)
                    {

                        tsc.SetException(CreateandLogFormattingException(ex, content));

                    }


                    return tsc.Task;
                }
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
