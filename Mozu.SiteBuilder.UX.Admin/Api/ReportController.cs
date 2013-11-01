using Mozu.Core.Api.Routing;
using Mozu.Reporting.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Http;

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

            return Request.CreateResponse(HttpStatusCode.OK, resp, new MediaTypeHeaderValue("text/csv"));
        }
    }
}
