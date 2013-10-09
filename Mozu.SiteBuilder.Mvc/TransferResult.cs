using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Http.Controllers;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.ViewEngine;


namespace Mozu.SiteBuilder.Mvc
{
    public class TransferResult : ActionResult
    {
        public string Url { get; private set; }

        public TransferResult(string url)
        {
            this.Url = url;
        }

        public override void ExecuteResult(HttpRequestMessage requestMessage)
        {

            var httpContext = requestMessage.HttpContext();

            // MVC 3 running on IIS 7+
            if (HttpRuntime.UsingIntegratedPipeline)
            {
                httpContext.Server.TransferRequest(this.Url, true);
            }
            else
            {
                
                throw new NotImplementedException("doh");
            }
        }
    }
}
