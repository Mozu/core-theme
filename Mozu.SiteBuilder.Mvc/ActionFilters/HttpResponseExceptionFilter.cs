using System;
using System.Collections.Generic;
using System.Text;
using System.Web.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class HttpResponseExceptionFilter : IActionFilter, IOrderedFilter
    {
        public void OnActionExecuting(ActionExecutingContext context) { }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            if (!(context.Exception is HttpResponseException exception)) return;

            context.Result = new ObjectResult(exception.Value)
            {
                StatusCode = exception.Status,
            };
            context.ExceptionHandled = true;
        }

        public int Order { get; }
    }

    public class HttpResponseException : Exception
    {
        public HttpResponseException( Exception inner, string message, int? statusCode ): base(message,inner)
        {
            if (statusCode.HasValue)
            {
                Status = statusCode.Value;
            }

            Value = inner;
        }

        public HttpResponseException(int statusCode) : base("Error")
        {
            Status = statusCode;
        }


        public int Status { get; set; } = 500;

        public object Value { get; set; }
    }
}
