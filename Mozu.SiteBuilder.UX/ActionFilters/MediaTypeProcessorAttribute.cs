using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Mozu.SiteBuilder.UX.ActionFilters
{
    public class JsonPostResult
    {
        public JsonPostResult()
        {
            ErrorCount = 0;
        }
        public string ErrorMessage
        {
            get;
            set;
        }
        public int ErrorCount
        {
            get;
            set;
        }
        public object Data
        {
            get;
            set;
        }
    }
    public class MediaTypeProcessorAttribute : System.Web.Mvc.ActionFilterAttribute 
    {
        public override void OnActionExecuted(System.Web.Mvc.ActionExecutedContext filterContext)
        {
            
            if ((string)filterContext.RouteData.Values["mediaType"] == "json" ||
                ( filterContext.HttpContext != null && 
                   filterContext.HttpContext.Request.ContentType != null && 
                   filterContext.HttpContext.Request.ContentType.StartsWith ("application/json" )))
            {
                var actionResult = filterContext.Result as ViewResultBase;
                if ( actionResult != null )
                {
                    JsonResult jresult = null;
                    if (filterContext.HttpContext != null && 
                        string.Equals ( filterContext.HttpContext.Request.HttpMethod , "POST", StringComparison.OrdinalIgnoreCase ))
                    {
                        jresult = new JsonResult()
                        {
                            Data = new JsonPostResult()
                            {
                                Data = actionResult.Model,
                                ErrorMessage = filterContext.Exception != null ? filterContext.Exception.ToString (): null,
                                ErrorCount = filterContext.Exception != null ? 1:  0 
                                
                            }
                            ,
                            JsonRequestBehavior = JsonRequestBehavior.AllowGet

                        };
                    }
                    else
                    {
                        jresult = new JsonResult()
                        {
                            Data = actionResult.Model,
                            JsonRequestBehavior = JsonRequestBehavior.AllowGet

                        };
                    }
                    filterContext.Result = jresult;
                }

            }
            base.OnActionExecuted(filterContext);
        }
    }
}



