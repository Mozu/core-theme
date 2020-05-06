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
using Mozu.Core.Api.Authorization;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/report", SuppressDescriptorGeneration = true)]
    public class ReportController : BaseController
    {
        private readonly IReportGenerator _reportGenerator;
        public ReportController(IApiContext apiContext, IReportGenerator reportGenerator, IBirstTokenGenerator birstTokenGenerator,
            ISettings settings)
        {
            _reportGenerator = reportGenerator;
           
        }


        [HttpPostRoute(UriTemplate = "lookerdashboard")]
        [BehaviorAuthorization(typeof(Mozu.Core.Behaviors.ReportReadBehavior))]
        public async Task<HttpResponseMessage> lookerdashboard(ReportParams reportParams)
        {
            var resp = (await _reportGenerator.GenerateDashboardUri(reportParams));

            return this.Request.CreateResponse(HttpStatusCode.OK, Single2(resp));
        }
    }
}
