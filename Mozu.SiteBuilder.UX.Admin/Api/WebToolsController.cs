using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Settings;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/webtools", SuppressDescriptorGeneration = true)]
    public class WebToolsController : BaseController
    {
        private readonly IWebToolsRepository _webToolsRepository;

        public WebToolsController(IWebToolsRepository webToolsRepository)
        {
            _webToolsRepository = webToolsRepository;
        }

        public class WmtReq 
        {
            public string Content { get; set; }
            public string Name { get; set; }
        }

		[HttpPostRoute(UriTemplate = "webmasterTools")]
        public async Task<Response<string>> UpdateWebmasterTools(WmtReq req)
		{


		    await _webToolsRepository.SaveWebmasterToolsFile(req.Content, req.Name);

                return Message3<string>(true, "File uploaded");
            

         
        }

		[HttpPostRoute(UriTemplate = "robotsTxt")]
        public async Task<HttpResponseMessage> UpdateRobotsTxt(RobotsTxtSettings robots)
        {
            
            await _webToolsRepository.SaveRobotsContent(robots);

		    return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}