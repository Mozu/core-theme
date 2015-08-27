using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Mvc;
using System.Web.Routing;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Controllers;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Admin.Filters;

namespace Mozu.SiteBuilder.UX.Admin.Controllers
{
     [SiteBuilderAdminAuthorize]
    public class AdminApiControllerBase : ApiControllerBase
    {

        protected internal virtual RazorViewResult RazorView()
        {
            return this.RazorView(null, null);
        }

        protected internal virtual RazorViewResult RazorView(string viewName)
        {
            return this.RazorView(viewName, null);
        }

        protected internal virtual RazorViewResult RazorView(string viewName, object model)
        {

            if (model != null)
            {
                ViewData.Model = model;
            }
            if (string.IsNullOrEmpty(viewName))
            {

                viewName = (string)this.ControllerContext.RouteData.Values["action"];

            }

            return new RazorViewResult()
            {
                ViewName = viewName,

                ViewData = ViewData

            };
        }




        public class RazorViewResult : SiteBuilder.Mvc.ActionResults.ViewResultBase   //System.Web.Mvc.ViewResultBase
        {

            public override void ExecuteResult(HttpRequestMessage  requestMessage)
            {
                var httpContext = requestMessage.Resolve<HttpContextBase>();
                var routeData = new RouteData();

                var res = new InnerViewResult()
                {
                    RequestMessage = requestMessage,
                    ViewName = this.ViewName


                };
                this.ViewData.Each(x => res.ViewData[x.Key] = x.Value);
                requestMessage.GetRouteData().Values.Each(x => routeData.Values[x.Key] = x.Value);
                var cc = new ControllerContext(httpContext, routeData, new InnerViewResult.FooController());
                res.ExecuteResult(cc);

            }




            public class InnerViewResult : System.Web.Mvc.ViewResultBase
            {
                public HttpRequestMessage RequestMessage { get; set; }
                public override void ExecuteResult(ControllerContext context)
                {
                    if (context == null)
                    {
                        throw new ArgumentNullException("context");
                    }
                    if (string.IsNullOrEmpty(this.ViewName))
                    {
                        this.ViewName = context.RouteData.GetRequiredString("action");
                    }




                    ViewEngineResult result = null;
                    if (this.View == null)
                    {
                        result = this.FindView(context);
                        this.View = result.View;
                    }
                    TextWriter output = context.HttpContext.Response.Output;
                    ViewContext viewContext = new ViewContext(context, this.View, this.ViewData, this.TempData, output);
                    this.View.Render(viewContext, output);
                    if (result != null)
                    {
                        result.ViewEngine.ReleaseView(context, this.View);
                    }
                }

                protected override ViewEngineResult FindView(ControllerContext context)
                {

                    return base.ViewEngineCollection.FindView(context, base.ViewName, null);


                }
                public class FooController : ControllerBase
                {

                    protected override void ExecuteCore()
                    {
                        throw new NotImplementedException();
                    }
                }
            }




        }
    }
}
