using System;
using System.Net.Http;
using System.Text;
using System.Web;
using Microsoft.AspNetCore.Http;
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
            var response = requestMessage.HttpContext().Response;
            if (!string.IsNullOrEmpty(ContentType))
            {
                response.ContentType = ContentType;
            }
            if (ContentEncoding != null)
            {
                response.Headers["Content-Encoding"] = ContentEncoding.HeaderName;
            }

            if (Content == null) return;
            var bytes = ContentEncoding != null ? ContentEncoding.GetBytes(Content) : Encoding.Default.GetBytes(Content);
            response.Body.Write(bytes);
        }
    }
}