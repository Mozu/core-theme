using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.ActionResults
{
    public class RazorViewResult : SiteBuilder.Mvc.ActionResults.ViewResultBase   //System.Web.Mvc.ViewResultBase
    {

        public override void ExecuteResult(HttpRequestMessage requestMessage)
        {
            var httpContext = requestMessage.Resolve<HttpContextBase>();
            var routeData = new RouteData();

            var res = new InnerViewResult()
            {
                RequestMessage = requestMessage,
                ViewName = this.ViewName


            };
            this.ViewData.Each(x => res.ViewData[x.Key] = x.Value);
            res.ViewData.Model = ViewData.Model;
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
