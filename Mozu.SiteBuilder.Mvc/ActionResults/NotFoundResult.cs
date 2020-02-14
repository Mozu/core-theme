using System.Net.Http;
using System.Text;
using System.Web;
using Microsoft.AspNetCore.Http;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.ActionResults
{
    public class NotFoundResult : ActionResult 
    {
        public override void ExecuteResult(HttpRequestMessage requestMessage)
        {
            var response = requestMessage.HttpContext().Response;
            response.StatusCode = 404;
        }
    }
}