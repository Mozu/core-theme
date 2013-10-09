//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Net;
//using System.Net.Http;
//using System.Threading.Tasks;
//using System.Web;

//using Mozu.SiteBuilder.Mvc;
//using Mozu.SiteBuilder.Mvc.CMS;
//using Mozu.SiteBuilder.UX.Models.Admin.CMS;

//namespace Mozu.SiteBuilder.UX.ActionFilters
//{
//    public class NotFoundActionHttpFilter :System.Web.Http.Filters.IActionFilter
//    {

//        Task<System.Net.Http.HttpResponseMessage> System.Web.Http.Filters.IActionFilter.ExecuteActionFilterAsync(System.Web.Http.Controllers.HttpActionContext actionContext, System.Threading.CancellationToken cancellationToken, Func<Task<System.Net.Http.HttpResponseMessage>> continuation)
//        {
//            return continuation().ContinueWith((x) =>
//                {
//                    if (x.Result.StatusCode == HttpStatusCode.NotFound)
//                    {
//                        return new HttpResponseMessage(HttpStatusCode.BadGateway);
//                    }
//                    return x.Result;
//                });
            
//        }

//        bool System.Web.Http.Filters.IFilter.AllowMultiple
//        {
//            get { return false; }
//        }
//    }
//    public class NotFoundActionFilter23 : System.Web.Mvc.IActionFilter {


//        public void OnActionExecuted(System.Web.Mvc.ActionExecutedContext filterContext)
//        {
//            if (filterContext.Result != null && !filterContext.IsChildAction  && filterContext.Result is HttpNotFoundResult)
//            {
//                var ctx = SiteBuilderContext.GetFromContext(filterContext.HttpContext);
//                var pc = ctx.PageContext;

//                pc.CmsContext = new CmsPageContext()
//                {
//                    Template = new DocumentRequest()
//                    {
//                        Path = "404"
//                    }

//                };
//                var cmsService = ctx.Resolve<ICmsServiceWrapper>();
//                var helper = new CmsHelper(cmsService);
//                try
//                {
//                    var task = helper.InitCmsPageContext(ctx.PageContext.CmsContext);
//                    if (!task.IsCompleted)
//                    {
//                        task.Wait();
                        
//                    }

//                }
//                catch (Exception ex)
//                {
//                    //todo
//                    System.Diagnostics.Debug.Write(ex);
//                }


//                filterContext.Result = new ViewResult { ViewName = "404", ViewData = filterContext.Controller.ViewData , TempData = filterContext.Controller.TempData };

//            }
//        }

//        public void OnActionExecuting(System.Web.Mvc.ActionExecutingContext filterContext)
//        {
           
//        }
//    }
//}