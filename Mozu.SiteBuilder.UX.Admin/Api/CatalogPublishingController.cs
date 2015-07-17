using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    /// <summary>
    /// Controller for CMS smiegels.
	/// </summary>
    [WebApi("app/catalogpublishing", SuppressDescriptorGeneration = true)]
    public class CatalogPublishingController : BaseController
    {
        private DC.Clients.IPublishingWebApiClient _publishingClient;
        private DC.PublishingScope ALL_PRODUCTS_SCOPE = new DC.PublishingScope { AllPending = true };

        /// <summary>
        /// Public controller.
        /// </summary>
        public CatalogPublishingController(IPublishingWebApiClient publishingClient)
        {
            _publishingClient = publishingClient;
        }

        /// <summary>
        /// Publish all catalog changes.
        /// </summary>
        [HttpPostRoute(UriTemplate = "publishall")]
        public async Task<Response<Product>> PublishAll()
        {
            var response = await _publishingClient.PublishDrafts(ALL_PRODUCTS_SCOPE);
            if (response.HasException)
            {
                throw response.ReadException();
            }
            return new Response<Product> { Success = true };
        }


        /// <summary>
        /// Publish catalog changes.
        /// </summary>
        [HttpPostRoute(UriTemplate = "publish")]
        public async Task<Response<Product>> Publish(List<string> productCodes)
        {
            var response = await _publishingClient.PublishDrafts(new DC.PublishingScope()
                                                                     {
                                                                         ProductCodes = productCodes
                                                                     });
            if (response.HasException)
            {
                throw response.ReadException();
            }
            return new Response<Product> { Success = true };
        }

        /// <summary>
        /// Discard all catalog changes.
        /// </summary>
        [HttpPostRoute(UriTemplate = "discardall")]
        public async Task<Response<Product>> DiscardAll()
        {
            var response = await _publishingClient.DiscardDrafts(ALL_PRODUCTS_SCOPE);
            if (response.HasException)
            {
                throw response.ReadException();
            }
            return new Response<Product> { Success = true };
        }


        /// <summary>
        /// Discard  catalog changes.
        /// </summary>
        [HttpPostRoute(UriTemplate = "discard")]
        public async Task<Response<Product>> Discard(List<string> productCodes)
        {
            var response = await _publishingClient.DiscardDrafts(new DC.PublishingScope()
                                                                     {
                                                                         ProductCodes = productCodes
                                                                 });
            if (response.HasException)
            {
                throw response.ReadException();
            }
            return new Response<Product> { Success = true };
        }
    }
}
