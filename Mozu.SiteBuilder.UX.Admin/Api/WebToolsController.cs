using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Content.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Settings;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class WebToolsController : BaseController
    {
        private readonly IDocumentWebApiClient _documentWebApiClient;
        private readonly ICmsServiceWrapper _cmsServiceWrapper;

        public WebToolsController(IDocumentWebApiClient documentWebApiClient, ICmsServiceWrapper cmsServiceWrapper)
        {
            _documentWebApiClient = documentWebApiClient;
            _cmsServiceWrapper = cmsServiceWrapper;
        }

        [WebInvoke(UriTemplate = "/webmasterTools", Method = "POST")]
        public Task<Response<WebmasterToolsSettings>> UpdateWebmasterTools(WebmasterToolsSettings settings)
        {
            return Single(new WebmasterToolsSettings());
        }
    }
}