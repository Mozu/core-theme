using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
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

        [WebInvoke(UriTemplate = "webmasterTools", Method = "POST")]
        public async Task<Response<string>> UpdateWebmasterTools()
        {
            if (!Request.Content.IsMimeMultipartContent())
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);

            Task<Response<string>> result;
            try
            {
                var provider = await Request.Content.ReadAsMultipartAsync(new MultipartFormDataStreamProvider(Path.GetTempPath()));

                var file = provider.FileData.First();
                var fileName = file.Headers.ContentDisposition.FileName.Replace("\"", "");
                await _webToolsRepository.SaveWebmasterToolsFile(file.LocalFileName, fileName);

                return await Message<string>(true, "File uploaded");
            }
            catch (Exception ex)
            {
                result = Message<string>(false, ex.Message);
            }

            return await result;
        }

        [WebInvoke(UriTemplate = "robotsTxt", Method = "POST")]
        public Task<Response<RobotsTxtSettings>> UpdateRobotsTxt(RobotsTxtSettings settings)
        {
            _webToolsRepository.SaveRobotsContent(settings);

            return Single(settings);
        }
    }
}