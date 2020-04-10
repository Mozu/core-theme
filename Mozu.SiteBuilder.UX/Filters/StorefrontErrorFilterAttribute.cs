using System;
using System.Diagnostics;
using System.Net;
using System.Net.Http;
using System.Web.Http;
//using Magnum.Extensions;
using Mozu.Core.Api.ErrorHandler;

using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Logging;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;

namespace Mozu.SiteBuilder.UX.Filters
{

 //todo reimplement error handling 



    //public class StorefrontErrorFilterAttribute : System.Web.Http.Filters.ExceptionFilterAttribute
    //{

        
    //    private ApiExceptionFilter _chainFilter;

    //    public StorefrontErrorFilterAttribute(ApiExceptionFilter chainFilter)
    //    {
            
    //        _chainFilter = chainFilter;
    //    }

    //    public bool IncludeExceptionDetail
    //    {
    //        get
    //        {
    //            return MozuConfigurationManager.Settings.AppSettingsAsNullableBool("ReturnDetailedExceptionInfo").GetValueOrDefault(false);
    //        }
    //    }

    //    public override void OnException(System.Web.Http.Filters.HttpActionExecutedContext actionExecutedContext)
    //    {

    //        // Call the Mozu.Core.Api exception filter first. That way, if it sets ActionContext.Response, we can overwrite it.
    //        _chainFilter.OnException(actionExecutedContext);

    //        HttpStatusCode? statusCode = null;
    //        if (actionExecutedContext.ActionContext.Response != null
    //         && actionExecutedContext.ActionContext.Response.Content != null
    //         && actionExecutedContext.ActionContext.Request.Content.Headers.ContentType != null
    //         && !string.IsNullOrEmpty(actionExecutedContext.ActionContext.Request.Content.Headers.ContentType.MediaType)
    //         && !string.Equals(actionExecutedContext.ActionContext.Request.Content.Headers.ContentType.MediaType, "text/html"))
    //        {
    //            statusCode = HttpStatusCode.UnsupportedMediaType;
    //        }


    //        string correlationId = actionExecutedContext.Request.Resolve<ExceptionContextLogWrapper>().GetCorrelationId();

    //        var model = new HttpError(actionExecutedContext.Exception, IncludeExceptionDetail);
    //        if (!String.IsNullOrEmpty(correlationId))
    //        {
    //            model["correlationId"] = correlationId;
    //        }
    //        var pageContext = actionExecutedContext.Request.Resolve<PageContext>();
    //        if (pageContext != null && pageContext.Visit != null)
    //        {
    //            model["visitId"] = pageContext.Visit.VisitId;
    //        }
    //        model["_ex"] = actionExecutedContext.Exception;


    //        actionExecutedContext.ActionContext.Response = actionExecutedContext.ActionContext.Request.CreateResponse(HttpStatusCode.InternalServerError, model);

    //        if (statusCode.HasValue)
    //        {
    //            actionExecutedContext.ActionContext.Response.StatusCode = statusCode.Value;
    //        }
    //    }
    //}
}
