using System.Net.Http;
using System.Net.Http.Headers;
using Mozu.Core.Api.Routing;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/reporting", SuppressDescriptorGeneration = true)]
    public class ReportingController : BaseController
    {
        ReportingData.DataGeneration _reportingProvider;

        public ReportingController()
        {
            _reportingProvider = new ReportingData.DataGeneration();
        }

        private HttpResponseMessage getResponseFromString(string s)
        {
            var resp = new HttpResponseMessage()
            {
                Content = new StringContent(s)
            };
            resp.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            return resp;
        }

        [HttpGetRoute(UriTemplate = "OrderPerDay")]
        public HttpResponseMessage OrderPerDay()
        {
            return getResponseFromString(_reportingProvider.OrderPerDay());
        }

        [HttpGetRoute(UriTemplate = "OrdersByDevice")]
        public HttpResponseMessage OrdersByDevice()
        {
            return getResponseFromString(_reportingProvider.OrdersByDevice());
        }

        [HttpGetRoute(UriTemplate = "SalesTotalsByWeek")]
        public HttpResponseMessage SalesTotalsByWeek()
        {
            return getResponseFromString(_reportingProvider.SalesTotalsByWeek());
        }

        [HttpGetRoute(UriTemplate = "RawOrderInfo?start={start}&limit={limit}")]
        public HttpResponseMessage RawOrderInfo(int start = 0, int limit = 200)
        {
            return getResponseFromString(_reportingProvider.RawOrderInfo(start, limit));
        }
    }
}
