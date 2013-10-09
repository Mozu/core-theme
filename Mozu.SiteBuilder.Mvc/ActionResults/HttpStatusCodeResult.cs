using System.Net.Http;
using System.Web;
using Autofac;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.ActionResults
{
    public class HttpStatusCodeResult : ActionResult
    {
        private readonly int _statusCode;
        private readonly string _statusDescriptoin;

        public HttpStatusCodeResult(int statusCode, string statusDescriptoin = null
            )
        {
            _statusCode = statusCode;
            _statusDescriptoin = statusDescriptoin;

        }

        public override void ExecuteResult(HttpRequestMessage requestMessage)
        {
            var context = requestMessage.LifetimeScope().Resolve<HttpContextBase>();
            context.Response.StatusCode = _statusCode;
            if (!string.IsNullOrEmpty(_statusDescriptoin))
            {
                context.Response.StatusDescription = _statusDescriptoin;
            }



        }
    }
}