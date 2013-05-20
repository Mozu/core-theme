using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Mozu.SiteBuilder.UX.ActionFilters
{
    public class NotFoundActionFilter : System.Web.Mvc.IActionFilter {


        public void OnActionExecuted(System.Web.Mvc.ActionExecutedContext filterContext)
        {
            if (filterContext.Result != null && filterContext.Result is HttpNotFoundResult)
            {
                filterContext.Result = new ViewResult { ViewName = "404", ViewData = filterContext.Controller.ViewData , TempData = filterContext.Controller.TempData };

            }
        }

        public void OnActionExecuting(System.Web.Mvc.ActionExecutingContext filterContext)
        {
           
        }
    }
}