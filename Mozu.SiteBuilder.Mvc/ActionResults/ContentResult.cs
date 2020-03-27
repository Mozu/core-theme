using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.ActionResults
{
    public class ContentResult : IActionResult 
    {
        public string Content { get; set; }
        public Encoding ContentEncoding { get; set; }
        public string ContentType { get; set; }

        public Task ExecuteResultAsync(ActionContext context)
        {
            var response = context.HttpContext.Response;
            if (!string.IsNullOrEmpty(ContentType))
            {
                response.ContentType = ContentType;
            }
            if (ContentEncoding != null)
            {
                response.Headers["Content-Encoding"] = ContentEncoding.HeaderName;
            }

            if (Content == null) return Task.CompletedTask;

            var bytes = ContentEncoding != null ? ContentEncoding.GetBytes(Content) : Encoding.Default.GetBytes(Content);
            response.Body.Write(bytes);

            return Task.CompletedTask;
        }
    }
}