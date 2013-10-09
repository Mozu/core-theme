using System.Net.Http;
using System.Web;
using Autofac;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.ActionResults
{
    public class HttpNotFoundResult : ActionResult
    {
        private readonly string _message;

        public HttpNotFoundResult(string message = null)
        {
            _message = message;
        }

        public override void ExecuteResult(HttpRequestMessage requestMessage)
        {
            var context = requestMessage.LifetimeScope().Resolve<HttpContextBase>();
            context.Response.StatusCode = 404;
            if (!string.IsNullOrEmpty(_message))
            {
                context.Response.StatusDescription = _message;
            }



        }


    }
}