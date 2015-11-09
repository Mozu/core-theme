using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;

namespace Mozu.SiteBuilder.Mvc.MessageHandler
{
    public class FourHundredMessageHandler : DelegatingHandler
    {
        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            var response = await base.SendAsync(request, cancellationToken).ConfigureAwait(false);

            if ((int)response.StatusCode >= 400 && (int)response.StatusCode < 500 && request.Headers.Accept.Any(x => string.Equals(x.MediaType, "text/html", StringComparison.OrdinalIgnoreCase)))
            {
                var iSiteBuilderApiContext = request.Resolve<ISiteBuilderApiContext>();
                if (!iSiteBuilderApiContext.SiteId.HasValue)
                {
                    var redir = request.CreateResponse(HttpStatusCode.Moved);
                    redir.Headers.Location = new Uri("/admin/auth/launchpad", UriKind.Relative);
                    return redir;
                }

                return await Process400(request, response).ConfigureAwait(false);
            }
            return response;
        }

        private static async Task<HttpResponseMessage> Process400(HttpRequestMessage request, HttpResponseMessage message)
        {
            var pageContext = request.Resolve<PageContext>();
             var siteContext = request.Resolve<SiteContext>();
            var cmsHelper = request.Resolve<CmsHelper>();
            pageContext.CmsContext = new CmsPageContext()
            {
                Initialized = false,
                Template = new DocumentRequest()
                {
                    ListFQN = "pageTemplateContent@mozu",
                    Path = "404"
                }
            };
            await cmsHelper.InitCmsPageContext(pageContext, siteContext).ConfigureAwait(false);
            var viewResult = new ViewResult()
            {
                Model = null,
                ViewName = "404",
                ViewData = new ViewDataDictionary()
            };
            return request.CreateResponse(message.StatusCode, viewResult);
        }
    }
}
