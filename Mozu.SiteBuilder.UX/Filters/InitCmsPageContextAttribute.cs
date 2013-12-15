//using System;
//using System.Net.Http;
//using System.Threading;
//using System.Threading.Tasks;
//using System.Web.Http.Controllers;
//using System.Web.Http.Filters;
//using Mozu.SiteBuilder.UX.Controllers;

//namespace Mozu.SiteBuilder.UX.Filters
//{
//    public class ContextInitializationAttribute2 : Attribute, IActionFilter
//    {
//        public Task<HttpResponseMessage> ExecuteActionFilterAsync(HttpActionContext actionContext, CancellationToken cancellationToken, Func<Task<HttpResponseMessage>> continuation)
//        {
//            var controller = (BaseApiController) actionContext.ControllerContext.Controller;
//            if (controller != null || !controller.ContextInitilaztionTasks.IsCompleted)
//            {
//                return continuation().ContinueWith(x => controller.ContextInitilaztionTasks.ContinueWith(y => x.Result)).Unwrap();
//            }
//            return continuation();
//        }

//        public bool AllowMultiple
//        {
//            get { return false; }
//        }
//    }
//}