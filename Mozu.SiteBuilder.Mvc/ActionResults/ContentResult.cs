using System.Net.Http;
using System.Text;
using System.Web;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.ActionResults
{
    public class ContentResult : ActionResult 
    {
        public string Content { get; set; }
        public Encoding ContentEncoding { get; set; }
        public string ContentType { get; set; }


        public override void ExecuteResult(HttpRequestMessage requestMessage)
        {
            HttpResponseBase response = requestMessage.HttpContext().Response;
            if (!string.IsNullOrEmpty(ContentType))
            {
                response.ContentType = ContentType;
            }
            if (ContentEncoding != null)
            {
                response.ContentEncoding = ContentEncoding;
            }
            if (Content != null)
            {
                response.Write(Content);
            }
        }
    }
}