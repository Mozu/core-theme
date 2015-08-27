using System.Net.Http;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.ActionResults
{
    public abstract class ActionResult
    {
        // Methods



        public abstract void ExecuteResult(HttpRequestMessage requestMessage);
    }
    public interface  IActionResultAsync
    {
        Task  ExecuteResultAsync(HttpRequestMessage requestMessage);
    }
}