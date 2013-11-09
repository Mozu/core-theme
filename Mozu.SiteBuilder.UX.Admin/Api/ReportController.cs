using Mozu.Core.Api.Routing;
using Mozu.Reporting.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

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

        IEnumerable<Dictionary<string, object>> extractReportRows(Reporting.Contracts.ReportPagedCollection resp)
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
        public async Task<HttpResponseMessage> Read([FromUri]PagingParamaters pagingParams, [FromUri]string filter, [FromUri] string groupBy, string name)
        {
            var serviceResponse = (await _reportWebApiClient.GetReport(name, pagingParams.startIndex, pagingParams.pageSize, null, filter, groupBy)).ReadAsSync();
            var rows = extractReportRows(serviceResponse);

            // return rows with meta data
            var resp = List2(rows.ToList(), serviceResponse.Report.GrandTotals, total: (int)serviceResponse.TotalCount);
            return this.Request.CreateResponse(HttpStatusCode.OK, resp, new System.Net.Http.Formatting.JsonMediaTypeFormatter());
        }

        [HttpGetRoute(UriTemplate = "download/{name}")]
        public async Task<HttpResponseMessage> Download([FromUri]string filter, [FromUri] string groupBy, string name)
        {
            var serviceResponse = await _reportWebApiClient.GetReportFile(name, null, filter, groupBy);

            var httpContent = serviceResponse.ResponseMessage.Content;

            var contentStream = await httpContent.ReadAsStreamAsync();
            var resp = new HttpResponseMessage(HttpStatusCode.OK);
            resp.Content = new StreamContent(contentStream);
            resp.Content.Headers.ContentLength = serviceResponse.ResponseMessage.Content.Headers.ContentLength;
            resp.Content.Headers.ContentType = serviceResponse.ResponseMessage.Content.Headers.ContentType;
            resp.Content.Headers.ContentDisposition = serviceResponse.ResponseMessage.Content.Headers.ContentDisposition;
            return resp;
        }

        [HttpGetRoute(UriTemplate = "listDefinitions")]
        public async Task<HttpResponseMessage> ListDefinitions()
        {
            var resp = (await _reportDefinitionWebApiClient.GetReportDefinitions()).ReadAsSync();

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(resp), LowerCaseJsonMediaTypeFormatter.Default);
        }
    }
}
