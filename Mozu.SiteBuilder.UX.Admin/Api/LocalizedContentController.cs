using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Provisioning;
using Mozu.Core.Api.Routing;
using Mozu.Core.Domain;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;

using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Localization;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/localizedcontent", SuppressDescriptorGeneration = true)]
    public class LocalizedContentController : BaseController
    {
        private readonly IAttributeWebApiClient _attributeWebApiClient;
        private readonly IProductWebApiClient _productWebApiClient;
        private readonly IMasterCatalogWebApiClient _masterCatalogWebApiClient;
        private readonly ISettings _settings;
        private readonly IApiContext _apiCtx;


        public LocalizedContentController(IAttributeWebApiClient attributeWebApiClient, IProductWebApiClient productWebApiClient, IMasterCatalogWebApiClient masterCatalogWebApiClient,
            ISettings settings, IApiContext apiCtx)
        {
            _attributeWebApiClient = attributeWebApiClient;
            _productWebApiClient = productWebApiClient;
            _masterCatalogWebApiClient = masterCatalogWebApiClient;
            _settings = settings;
            _apiCtx = apiCtx;
        }

        [HttpGetRoute(UriTemplate = "attributes/read")]
        public async Task<Response<List<Models.Localization.LocalizedAttribute>>> GetLocalizedAttributes([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            var fakeData = CreateFakeAttributeData();
            var result = await Task.FromResult(fakeData);
            return List2(result);
        }

        [HttpGetRoute(UriTemplate = "attributes/edit/{attributeFqn}")]
        public async Task<Response<SiteShippingSettings>> UpsertLocalizedAttributes(Models.Localization.LocalizedAttribute localizedAttribute, string attributeFqn)
        {
            //map to dc attribute.
            //await _attributeWebApiClient.UpdateLocalizedContents()
            throw new NotImplementedException();
        }

        [HttpGetRoute(UriTemplate = "attributevalues/read")]
        public async Task<Response<List<Models.Attributes.Attribute>>> GetLocalizedAttributeValues([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            throw new NotImplementedException();
        }
        
        [HttpGetRoute(UriTemplate = "attributevalues/edit")]
        public async Task<Response<SiteShippingSettings>> UpsertLocalizedAttributeValues()
        {
            //await _attributeWebApiClient.UpdateAttributeVocabularyValueLocalizedContents()
            throw new NotImplementedException();
        } 

        [HttpGetRoute(UriTemplate = "product/properties/read")]
        public async Task<Response<List<Models.Attributes.Attribute>>> GetLocalizedProductProperties([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            throw new NotImplementedException();
        }

        [HttpGetRoute(UriTemplate = "product/properties/edit")]
        public async Task<Response<SiteShippingSettings>> UpsertLocalizedProductProperties()
        {
            //await _productWebApiClient.UpdatePropertyValueLocalizedContents();
            throw new NotImplementedException();
        } 
        
        [HttpGetRoute(UriTemplate = "productextras/read")]
        public async Task<Response<List<Models.Attributes.Attribute>>> GetLocalizedProductExtras([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            
            throw new NotImplementedException();
        }

        [HttpGetRoute(UriTemplate = "productextras/edit")]
        public async Task<Response<SiteShippingSettings>> UpsertLocalizedProductExtras()
        {
            throw new NotImplementedException();
        } 
        
        [HttpGetRoute(UriTemplate = "productvariants/read")]
        public async Task<Response<List<Models.Attributes.Attribute>>> GetLocalizedProductVariants([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            throw new NotImplementedException();
        }

        [HttpGetRoute(UriTemplate = "productvariants/edit")]
        public async Task<Response<SiteShippingSettings>> UpsertLocalizedProductVariants()
        {
            throw new NotImplementedException();
        }


        #region privates

        private List<LocalizedAttribute> CreateFakeAttributeData()
        {
            return new List<Models.Localization.LocalizedAttribute>
            {
                CreatFakeAttrib("Color", "Coleur"),
                CreatFakeAttrib("Size", "Dimension"),
                CreatFakeAttrib("Material", "matériel")
            };
        }

        private LocalizedAttribute CreatFakeAttrib(string attr, string frAttr)
        {
            return new LocalizedAttribute
            {
                AdminName = attr + ": Shirts",
                AttributeFQN = "Tenant~" + attr + "-Shirts",
                Description = attr,
                Locale = "en-US",
                Name = attr,
                LocalizedValues = new List<LocalizedAttributeContent>
                {
                    new LocalizedAttributeContent
                    {
                        Locale = "fr-FR",
                        Description = frAttr,
                        Exists = true,
                        Name = frAttr
                    },
                    new LocalizedAttributeContent
                    {
                        Locale = "de-DE",
                        Description = null,
                        Exists = false,
                        Name = null
                    },
                }
            };
        }

        #endregion


    }
}