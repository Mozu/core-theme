//using System.Collections.Generic;
//using System.Web.Mvc;
//using Mozu.Core.Configuration;
//using Mozu.SiteBuilder.Mvc;
//using Mozu.SiteBuilder.UX.Models;
//using Mozu.SiteBuilder.Mvc.Extensions;


//namespace Mozu.SiteBuilder.UX.StartupTasks
//{
//    public class GlobalFilterConfigurationStartupTask : StartUpTask
//    {
//        #region Implementation of IStartupTask
		
//        public override void Execute()
//        {
//           // GlobalFilters.Filters.Add(new Mozu.SiteBuilder.UX.ActionFilters.AutoFacContextInjectorAttribute());
//            GlobalFilters.Filters.Add(new JsonHandleError());
//            GlobalFilters.Filters.Add(new PageHandleError());

//        }
//        #endregion
//    }

//    class PageHandleError : IExceptionFilter
//    {

//        public void OnException(ExceptionContext filterContext)
//        {
//            if (!filterContext.ExceptionHandled && filterContext.RequestContext.HttpContext.Request.ContentType != "application/json")
//            {
//                filterContext.ExceptionHandled = true;
//                filterContext.Result = new ViewResult()
//                                           {
//                                               ViewName = "error",
//                                               ViewData = new ViewDataDictionary(filterContext.Exception)
//                                           };
//            }

//        }
//    }

//    class JsonHandleError : IExceptionFilter
//    {

//        public void OnException(ExceptionContext filterContext)
//        {
//            if ( !filterContext.ExceptionHandled && filterContext.RequestContext.HttpContext.Request.ContentType == "application/json")
//            {
//                filterContext.HttpContext.Response.Clear();
//                // Prepare the response code.
//                filterContext.ExceptionHandled = true;
//                var mc = new List<MessageContainer>()
//                              {
//                               };
//                var ex = filterContext.Exception.UnwrapAgg();
//                if (ex is Mozu.Core.Api.Client.Exceptions.ApiWebClientException && ex.Data != null && ex.Data.Count > 0)
//                {
//                    foreach ( var item in ex.Data.Values)
//                    {
//                        mc.Add( new MessageContainer() { Message =item.ToString()});
//                    }
                    
//                }
//                else
//                {
//                    mc.Add(new MessageContainer()
//                               {
//                                   Message = ex.Message,
//                                   Stack = ex.ToString()
//                               });
//                }
//                filterContext.Result = new JsonDCResult()
//                {

//                    JsonRequestBehavior = JsonRequestBehavior.AllowGet,
//                    Data = new MessageContainerCollection()
//                               {
//                                   Messages = mc
//                               }
//                };
//            }
           
//        }
//    }
//}