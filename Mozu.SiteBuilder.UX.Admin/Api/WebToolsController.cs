using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Settings;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class WebToolsController : BaseController
    {
        private readonly IWebToolsRepository _webToolsRepository;

        public WebToolsController(IWebToolsRepository webToolsRepository)
        {
            _webToolsRepository = webToolsRepository;
        }

        [WebGet(UriTemplate = "webmasterTools")]
        public Task<Response<WebmasterToolsSettings>> GetWebmasterTools()
        {
            return Single(_webToolsRepository.Get<WebmasterToolsSettings>());
        }

        [WebInvoke(UriTemplate = "webmasterTools", Method = "POST")]
        public Task<Response<WebmasterToolsSettings>> UpdateWebmasterTools(WebmasterToolsSettings settings)
        {
            _webToolsRepository.Save(settings);

            return Single(settings);
        }

        [WebGet(UriTemplate = "robotsTxt")]
        public Task<Response<RobotsTxtSettings>> GetRobotsTxt()
        {
            return Single(_webToolsRepository.Get<RobotsTxtSettings>());
        }

        [WebInvoke(UriTemplate = "robotsTxt", Method = "POST")]
        public Task<Response<RobotsTxtSettings>> UpdateRobotsTxt(RobotsTxtSettings settings)
        {
            _webToolsRepository.Save(settings);

            return Single(settings);
        }
    }
}