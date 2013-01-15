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

            var streamProvider = new MultipartFormDataStreamProvider(Path.GetTempPath());

            Task<Response<string>> result;
            try
            {
                await Request.Content.ReadAsMultipartAsync(streamProvider);

                var file = streamProvider.FileData.First();
                var fileResult = _webToolsRepository.SaveWebmasterToolsFile(file.LocalFileName);

                return await (fileResult != null && !fileResult.IsFaulted
                        ? Message2<string>(true, "File uploaded")
                        : Message2<string>(false, "Failed to upload file"));
            }
            catch (Exception ex)
            {
                result = Message2<string>(false, ex.Message);
            }

            return await result;
        }

        /*[WebGet(UriTemplate = "robotsTxt")]
        public Task<Response<RobotsTxtSettings>> GetRobotsTxt()
        {
            return Single(_webToolsRepository.Get<RobotsTxtSettings>());
        }

        [WebInvoke(UriTemplate = "robotsTxt", Method = "POST")]
        public Task<Response<RobotsTxtSettings>> UpdateRobotsTxt(RobotsTxtSettings settings)
        {
            _webToolsRepository.Save(settings);

            return Single(settings);
        }*/
    }
}