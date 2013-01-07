using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Threading.Tasks;
using System.Web.Http.Filters;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.Core.Api.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    // TODO: The website api will always return JSON but we might want to make this fancy enough to support other types

    public class GlobalErrorHandler : IExceptionFilter
    {
        /*protected override bool OnTryProvideResponse(Exception exception, ref HttpResponseMessage message)
        {
            var ex = UnwrapAgg(exception);
            
            var errorCollection = ex.Data ["DataContract"] as ErrorCollection ;

            
            message = new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK ,
                Content = new ObjectContent<Response<string>>(new Response<string>
                {
                    Success = false,
                    Message = ex.Message+"\r\n" + ex.ToString(),
                   
                    ServiceErrorCollection = errorCollection
                }, "application/json")
            };

            return true;
        }*/
        Exception UnwrapAgg(Exception e)
        {

            while (e is AggregateException)
            {
                e = ((AggregateException)e).InnerExceptions[0];
            }
            return e;
        }

        public bool AllowMultiple { get; private set; }

        public Task ExecuteExceptionFilterAsync(HttpActionExecutedContext actionExecutedContext, System.Threading.CancellationToken cancellationToken)
        {
            var exception = actionExecutedContext.Exception;

            var errorCollection = exception.Data["DataContract"] as ErrorCollection;

            var response = new Response<string>
            {
                Success = false,
                Message = exception.Message + "\r\n" + exception,
                ServiceErrorCollection = errorCollection
            };

            actionExecutedContext.Response.Content = new ObjectContent<Response<string>>(response, new JsonMediaTypeFormatter());

            return new Task(() => { });
        }
    }
}