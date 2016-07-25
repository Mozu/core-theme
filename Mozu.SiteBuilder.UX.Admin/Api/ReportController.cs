using System;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Exceptions;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Reports;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/report", SuppressDescriptorGeneration = true)]
    public class ReportController : BaseController
    {
        private readonly IReportGenerator _reportGenerator;
        private readonly IBirstTokenGenerator _birstTokenGenerator;
        private string reportsStorePath = string.Empty;
        private IApiContext _apiContext;
        public ReportController(IApiContext apiContext, IReportGenerator reportGenerator, IBirstTokenGenerator birstTokenGenerator,
            ISettings settings)
        {
            _reportGenerator = reportGenerator;
            _birstTokenGenerator = birstTokenGenerator;
            reportsStorePath = settings.AllAppSettings["SiteBuilderReportRepo"];
            _apiContext = apiContext;
        }

        [HttpGetRoute(UriTemplate =  "list/read")]
        public async Task<Response<List<Report>>> Read(PagingParamaters pagingParams) 
        {
            var allReportsFile = Path.Combine(reportsStorePath, "global.json");
            var tenantReportsFile = Path.Combine(reportsStorePath, $"{_apiContext.TenantId}.json"); //optional
            if (!File.Exists(allReportsFile))
                throw new VaeMissingOrInvalidParameterException("Global reports file not found");

            try
            {
                var globalReportList = JsonConvert.DeserializeObject<List<Report>>(File.ReadAllText(allReportsFile));

                if (File.Exists(tenantReportsFile))
                {
                    var tenantReports = JsonConvert.DeserializeObject<List<Report>>(File.ReadAllText(tenantReportsFile));
                    var overRideReports = (from gr in globalReportList
                                           from tr in tenantReports where gr.ReportId == tr.ReportId
                                           select gr).ToList();
                    if (overRideReports.Any())
                        globalReportList.RemoveAll(x=> overRideReports.Contains(x));
                    
                    globalReportList.AddRange(tenantReports);
                }

                return List2(globalReportList.OrderBy(x=>x.Ordinality).ToList(), globalReportList.Count);
            }
            catch (Exception exc)
            {
                throw new VaeUnexpectedErrorException(exc.Message, exc);
            }
        }


        [HttpGetRoute(UriTemplate = "dashboard")]
        public async Task<HttpResponseMessage> Dashboard()
        {
            var resp = (await _birstTokenGenerator.GenerateDashboardUri());
            
            return this.Request.CreateResponse(HttpStatusCode.OK, Single2(resp));
        }

        [HttpPostRoute(UriTemplate = "chartiodashboard")]
        public async Task<HttpResponseMessage> Chartiodashboard(ReportParams reportParams)
        {
            var resp = (await _reportGenerator.GenerateDashboardUri(reportParams));

            return this.Request.CreateResponse(HttpStatusCode.OK, Single2(resp));
        }

    }
}
