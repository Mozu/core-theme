//using System;
//using System.Net;
//using System.Net.Http;
//using System.Threading;
//using System.Threading.Tasks;
//using System.Web.Http.Controllers;
//using System.Web.Http.Filters;
//using Mozu.SiteBuilder.Mvc.ActionResults;
//using Mozu.SiteBuilder.Mvc.CMS;
//using Mozu.SiteBuilder.Mvc.Contexts;
//using Mozu.SiteBuilder.Mvc.ViewEngine;
//using Mozu.SiteBuilder.UX.Models.Admin.CMS;

//namespace Mozu.SiteBuilder.Mvc.ActionFilters
//{



//    moved to message handler to handle missing routes.

//    public class ErrorFormattingActionFilterAttribute :  System.Attribute, IActionFilter
//    {
       

//        Task<HttpResponseMessage> IActionFilter.ExecuteActionFilterAsync(HttpActionContext actionContext, CancellationToken cancellationToken, Func<Task<HttpResponseMessage>> continuation)
//        {
//            return continuation();

//            //var response = await continuation().ConfigureAwait(false);
//            //if (response.StatusCode == HttpStatusCode.NotFound)
//            //{
//            //    var request = actionContext.Request;

//            //    var pageContext = request.Resolve<PageContext>();
//            //    var cmsHelper = request.Resolve<CmsHelper>();
//            //    pageContext.CmsContext = new CmsPageContext()
//            //                             {
//            //                                 Initialized = false,
//            //                                 Template = new DocumentRequest()
//            //                                            {
//            //                                                Collection = "templates",
//            //                                                Path = "404"
//            //                                            }
//            //                             };
//            //    await cmsHelper.InitCmsPageContext(pageContext).ConfigureAwait(false);
//            //    var viewResult = new ViewResult()
//            //                     {
//            //                         Model = null,
//            //                         ViewName = "404",
//            //                         ViewData = new ViewDataDictionary()
//            //                     };
//            //    return request.CreateResponse(HttpStatusCode.NotFound, viewResult);
//            //    //response.Content = new ObjectContent(typeof (ViewResult), ,new HtmlActionResultMediaTypeFormatter());


//            //}
//            //return response;
//        }

//        bool IFilter.AllowMultiple
//        {
//            get { return false; }
//        }
//    }
//}