using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core.Api.Client;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/report", SuppressDescriptorGeneration = true)]
    public class ReportController : BaseController
    {
        private readonly IReportGenerator _reportGenerator;
        private readonly IBirstTokenGenerator _birstTokenGenerator;

        public ReportController(IReportGenerator reportGenerator, IBirstTokenGenerator birstTokenGenerator)
        {
            _reportGenerator = reportGenerator;
            _birstTokenGenerator = birstTokenGenerator;
        }


        [HttpPostRoute(UriTemplate = "dashboard")]
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
