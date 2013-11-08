using Mozu.Core.Api.Routing;
using Mozu.Reporting.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Http;
using System.Linq;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/report", SuppressDescriptorGeneration = true)]
    public class ReportController : BaseController
    {

        private readonly IReportWebApiClient _reportWebApiClient;
        private readonly IReportDefinitionWebApiClient _reportDefinitionWebApiClient;

        public ReportController(IReportWebApiClient reportWebApiClient, IReportDefinitionWebApiClient reportDefinitionWebApiClient)
        {
            _reportWebApiClient = reportWebApiClient;
            _reportDefinitionWebApiClient = reportDefinitionWebApiClient;
        }

        Dictionary<string, object> extractReportRows(Reporting.Contracts.ReportPagedCollection resp)
        {
            var headerNames = resp.Report.Headers.Select(x => x.Key);
            var rows = resp.Items.Select(x => x.Data
                .Zip(headerNames, (val, key) => new { key = key, val = val })
                .ToDictionary(item => item.key, item => item.val))
                ;
            return rows;
        }

        [HttpGetRoute(UriTemplate = "list")]
        public async Task<HttpResponseMessage> List()
        {
            var resp = (await _reportWebApiClient.GetReports()).ReadAsSync();

            return this.Request.CreateResponse(HttpStatusCode.OK, Single2(resp), LowerCaseJsonMediaTypeFormatter.Default);
        }

        [HttpGetRoute(UriTemplate = "read/{name}")]
        public async Task<HttpResponseMessage> Read([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, string name)
        {
            var filter = this.HttpContext.Request.QueryString["filter"];
            var groupBy = this.HttpContext.Request.QueryString["groupBy"];
            var resp = (await _reportWebApiClient.GetReport(name, pagingParams.startIndex, pagingParams.pageSize, null, filter, groupBy)).ReadAsSync();

//            resp.Report.GrandTotals[0].Column
//            resp.Report.GrandTotals[0].Value

            return this.Request.CreateResponse(HttpStatusCode.OK, Single2(resp), new System.Net.Http.Formatting.JsonMediaTypeFormatter());
        }

        [HttpGetRoute(UriTemplate = "readExt/{name}")]
        public async Task<HttpResponseMessage> ReadExt([FromUri]PagingParamaters pagingParams, string name)
        {
            var filter = this.HttpContext.Request.QueryString["filter"];
            var groupBy = this.HttpContext.Request.QueryString["groupBy"];
            var resp = (await _reportWebApiClient.GetReport(name, pagingParams.startIndex, pagingParams.pageSize, null, filter, groupBy)).ReadAsSync();
            var rows = extractReportRows(resp);

            // todo: return grandTotals

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(rows.ToList(), total: (int)resp.TotalCount), new System.Net.Http.Formatting.JsonMediaTypeFormatter());
        }

        [HttpGetRoute(UriTemplate = "download/{name}")]
        public async Task<HttpResponseMessage> Download(string name)
        {
            var resp = (await _reportWebApiClient.GetReportFile(name)).ReadAsSync();

            return Request.CreateResponse(HttpStatusCode.OK, resp, new MediaTypeHeaderValue("text/csv"));
        }

        [HttpGetRoute(UriTemplate = "listDefinitions")]
        public async Task<HttpResponseMessage> ListDefinitions()
        {
            var resp = (await _reportDefinitionWebApiClient.GetReportDefinitions()).ReadAsSync();

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(resp), LowerCaseJsonMediaTypeFormatter.Default);
        }
    }
}
