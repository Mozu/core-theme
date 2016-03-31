using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Mozu.Core;
using Mozu.Core.Exceptions;
using Mozu.Core.Settings;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public interface IReportGenerator
    {
        Task<string> GenerateDashboardUri(ReportParams reportParams);
    }

    public class ReportGenerator : IReportGenerator
    {
        private const string BASEURL_KEY = "ChartIOEmbedUrl";
        private const string DASHBOARD_KEY = "ChartIODashboard";
        private const string ORGANIZATION_KEY = "ChartIOOrgId";
        private const string SECRET_KEY = "ChartIOSecret";
        private const string TIMEOUT_KEY = "ChartIOTimeout";

        private readonly ISettings _settings;
        private readonly IApiContext _apiContext;

        public ReportGenerator(IApiContext apiContext, ISettings settings)
        {
            _settings = settings;
            _apiContext = apiContext;
        }


        public async Task<string> GenerateDashboardUri(ReportParams reportParams)
        {
            var unixTime = (Int32)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
            var dashboardId =_settings.AppSettings(DASHBOARD_KEY);
            var orgId = _settings.AppSettings(ORGANIZATION_KEY);
            var secret = _settings.AppSettings(SECRET_KEY);
            var url = _settings.AppSettings(BASEURL_KEY);

            if (string.IsNullOrEmpty(dashboardId) || string.IsNullOrEmpty(orgId) || string.IsNullOrEmpty(secret) || string.IsNullOrEmpty(url))
                throw new VaeMissingOrInvalidParameterException("DashboardId or OrganizationId or Secret or Url is missing");
           
            
            var dateFormat = "yyyy-MM-dd";
            var request = new Dictionary<string, object>();
            var env = new Dictionary<string, object>();
            env.Add("DATE", new List<String> { reportParams.FromDate.ToString(dateFormat), reportParams.ToDate.ToString(dateFormat) });
            env.Add("TENANTID", _apiContext.TenantId);
            if (_apiContext.SiteId.HasValue)
                env.Add("SITEID", _apiContext.SiteId.Value);
            request.Add("iat", unixTime);
            request.Add("nbf", unixTime);
            request.Add("exp", unixTime + int.Parse(_settings.AppSettings(TIMEOUT_KEY)));
            request.Add("organization", int.Parse(orgId));
            request.Add("dashboard", int.Parse(dashboardId));
            request.Add("env", env);
            var token = JWT.JsonWebToken.Encode(request, secret, JWT.JwtHashAlgorithm.HS256);

            return string.Format("{0}/d/{1}/{2}", url, dashboardId, token);
        }

    }

    public class ReportParams
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
    }
}