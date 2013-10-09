using System.Net.Http;

namespace Mozu.SiteBuilder.Mvc.ActionResults
{
    public abstract class ActionResult
    {
        // Methods



        public abstract void ExecuteResult(HttpRequestMessage requestMessage);
    }
}