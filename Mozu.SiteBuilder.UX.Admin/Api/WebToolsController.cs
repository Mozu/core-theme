using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.Content.Contracts;
using Mozu.Content.Contracts.Clients;
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
        private readonly IDocumentPublishingWebApiClient _documentPublishingWebApiClient;
        private readonly IDocumentListWebApiClient _documentListWebApiClient;
        private const string ContentCollection = "siteSettings@mozu";
        private const string RobotsFileName = "robots.txt";
        
        public WebToolsController(IWebToolsRepository webToolsRepository,
            IDocumentListWebApiClient documentListWebApiClient,
            IDocumentPublishingWebApiClient documentPublishingWebApiClient)
        {
            _webToolsRepository = webToolsRepository;
            _documentListWebApiClient = documentListWebApiClient;
            _documentPublishingWebApiClient = documentPublishingWebApiClient;
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
            await _webToolsRepository.SaveRobotsContent(robots).ConfigureAwait(false);

            //Publish the document if it is not active.
            var docResult = (await _documentListWebApiClient.GetTreeDocument(ContentCollection, RobotsFileName))
                .ReadAsSync();

            if (docResult.PublishState == PublishStates.Draft)
            {
                var docIds = new List<string> {docResult.Id};
                await _documentPublishingWebApiClient.PublishDocuments(docIds).ConfigureAwait(false);
            }

		    return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}