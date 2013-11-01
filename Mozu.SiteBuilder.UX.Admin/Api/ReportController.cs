using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Mozu.Core.Api.Routing;
using Mozu.Reporting.Contracts.Clients;
using System.Net.Http;
using System.Net;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using System.Web.Http;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/report", SuppressDescriptorGeneration = true)]
    public class ReportController : BaseController
    {

        private readonly IReportWebApiClient _reportWebApiClient;

        public ReportController(IReportWebApiClient reportWebApiClient)
        {
            _reportWebApiClient = reportWebApiClient;
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

        [HttpGetRoute(UriTemplate = "list")]
        public async Task<HttpResponseMessage> GetLocationTypes()
        {
            var resp = (await _reportWebApiClient.GetReports()).ReadAsSync();

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(resp), LowerCaseJsonMediaTypeFormatter.Default);
        }

        [HttpGetRoute(UriTemplate = "read/{name}")]
        public async Task<HttpResponseMessage> Read([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, string name)
        {
            var resp = (await _reportWebApiClient.GetReport(name)).ReadAsSync();
//            var resp = (await _reportWebApiClient.GetReport(name, pagingParams.startIndex, pagingParams.pageSize)).ReadAsSync();

            return this.Request.CreateResponse(HttpStatusCode.OK, Single2(resp), LowerCaseJsonMediaTypeFormatter.Default);
        }

        [HttpGetRoute(UriTemplate = "download/{name}")]
        public async Task<HttpResponseMessage> Download(string name)
        {
            var resp = (await _reportWebApiClient.GetReportFile(name)).ReadAsSync();
            //            var resp = (await _reportWebApiClient.GetReport(name, pagingParams.startIndex, pagingParams.pageSize)).ReadAsSync();

            return Request.CreateResponse(HttpStatusCode.OK, resp, new MediaTypeHeaderValue("text/csv"));
            //return this.Request.CreateResponse(HttpStatusCode.OK, Single2(resp), LowerCaseJsonMediaTypeFormatter.Default);
        }

        //public HttpResponseMessage foo()
        //{
        //    var reportData = _reportWebApiClient.GetReports().ToString();
        //    return getResponseFromString(reportData);
        //}

        //[HttpGetRoute(UriTemplate = "OrderPerDay")]
        //public HttpResponseMessage OrderPerDay()
        //{
        //    return getResponseFromString(_reportingProvider.OrderPerDay());
        //}

        //[HttpGetRoute(UriTemplate = "OrdersByDevice")]
        //public HttpResponseMessage OrdersByDevice()
        //{
        //    return getResponseFromString(_reportingProvider.OrdersByDevice());
        //}

        //[HttpGetRoute(UriTemplate = "SalesTotalsByWeek")]
        //public HttpResponseMessage SalesTotalsByWeek()
        //{
        //    return getResponseFromString(_reportingProvider.SalesTotalsByWeek());
        //}

        //[HttpGetRoute(UriTemplate = "RawOrderInfo?start={start}&limit={limit}")]
        //public HttpResponseMessage RawOrderInfo(int start = 0, int limit = 200)
        //{
        //    return getResponseFromString(_reportingProvider.RawOrderInfo(start, limit));
        //}
    }
}
