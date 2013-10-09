using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;

using Mozu.Core.Api.Contracts;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;

namespace Mozu.SiteBuilder.UX.Filters
{
    public class ErrorFilterAttribute : System.Web.Http.Filters.ExceptionFilterAttribute
    {
        public override void OnException(System.Web.Http.Filters.HttpActionExecutedContext actionExecutedContext)
        {
            //pants
            var controller =  actionExecutedContext.ActionContext.ControllerContext.Controller as BaseApiController;
            if (controller != null && actionExecutedContext.ActionContext.Response == null )
            {
                var view = new ViewResult() {Model = actionExecutedContext.Exception, ViewName = "error"};
                actionExecutedContext.ActionContext.Response = actionExecutedContext.ActionContext.Request.CreateResponse(HttpStatusCode.InternalServerError, view);
           
            }

            base.OnException(actionExecutedContext);
        }

    }
}