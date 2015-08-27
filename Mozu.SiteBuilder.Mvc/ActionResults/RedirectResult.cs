using System.Net.Http;
using System.Web;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.ActionResults
{
    public class RedirectResult : ActionResult
    {
        public RedirectResult(string url)
            : this(url, false)
        {
        }

        public RedirectResult(string url, bool permanent)
        {
            Permanent = permanent;
            Url = url;
        }

        // Properties
        public bool Permanent { get; private set; }

        public string Url { get; private set; }


        public override void ExecuteResult(HttpRequestMessage requestMessage)
        {
            HttpResponseBase repsonse = requestMessage.HttpContext().Response;
            if (Permanent)
            {
                repsonse.RedirectPermanent(Url, false);
            }
            else
            {
                repsonse.Redirect(Url, false);
            }
        }
    }
}