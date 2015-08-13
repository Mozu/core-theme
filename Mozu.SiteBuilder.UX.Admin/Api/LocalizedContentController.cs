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
using MongoDB.Driver.Linq;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Routing;
using Mozu.Core.Domain;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Localization;
using Mozu.SiteBuilder.UX.Admin.Helpers.LocalizedContentHelpers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/localizedcontent", SuppressDescriptorGeneration = true)]
    public class LocalizedContentController : BaseController
    {
        private readonly IAttributeWebApiClient _attributeWebApiClient;
        private readonly IProductWebApiClient _productWebApiClient;
        private readonly IReportWebApiClient _reportWebApiClient;
        private readonly IApiContext _apiCtx;

        private TargetContextLevelType TargetContextLevel
        {
            get
            {
                return (_apiCtx.CatalogId.HasValue)
                    ? TargetContextLevelType.Catalog
                    : TargetContextLevelType.MasterCatalog;
            }
        }

        public LocalizedContentController(IAttributeWebApiClient attributeWebApiClient, IProductWebApiClient productWebApiClient, IReportWebApiClient reportWebApiClient, IApiContext apiCtx)
        {
            _attributeWebApiClient = attributeWebApiClient;
            _productWebApiClient = productWebApiClient;
            _reportWebApiClient = reportWebApiClient;
            _apiCtx = apiCtx;
        }

        [HttpGetRoute(UriTemplate = "attributes/read")]
        public async Task<Response<List<JObject>>> GetLocalizedAttributes([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            //var fakeData = CreateFakeAttributeJData();
            //var result = await Task.FromResult(fakeData);
            //return List2(result, 3);

            if (!_apiCtx.MasterCatalogId.HasValue)
            {
                return List2(new List<JObject>(), 0);
            }

            var attrs = (await _reportWebApiClient.GetAttributes(startIndex: pagingParams.startIndex, pageSize: pagingParams.pageSize,
                filter: extFilter.ToFilterString(), targetContextLevel: TargetContextLevelType.MasterCatalog)).ReadAsSync();

            var items = attrs.Items.Select(Mapper.Map<DC.ReportAttribute, JObject>).Where(x => x != null).ToList();
            return List2(items, attrs.TotalCount);

        }

        [HttpPostRoute(UriTemplate = "attributes/edit")]
        public async Task<Response<JObject>> UpsertLocalizedAttributes(JObject jObject)
        {
            var attr = jObject.ToObject<LocalizedAttribute>();
            var localizedContent = (from supportedLocale in attr.SupportedLocales
                                    let localizedName = (string)jObject["name_" + supportedLocale]
                                    where ! string.IsNullOrEmpty(localizedName)
                                    select new DC.AttributeLocalizedContent
                                    {
                                        LocaleCode = supportedLocale,
                                        Name = localizedName
                                    }).ToList();

            var updatedResults = (await _attributeWebApiClient.UpdateLocalizedContents(localizedContent, attr.AttributeFQN, responseFields:null, targetContextLevel: TargetContextLevelType.MasterCatalog)).ReadAsSync();
            var jResult = ReportLocalizedConverterHelper.AddLocalizedValues("name_", attr, updatedResults, (property, locales) => property.SupportedLocales = locales,
                rptContent => rptContent.LocaleCode, rptContent => rptContent.Name, attr.LocaleCode, attr.SupportedLocales);
            return Single2(jResult);
        }

        [HttpGetRoute(UriTemplate = "attributevalues/read")]
        public async Task<Response<List<JObject>>> GetLocalizedAttributeValues([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            if (!_apiCtx.MasterCatalogId.HasValue)
            {
                return List2(new List<JObject>(), 0);
            }

            var attrs = (await _reportWebApiClient.GetAttributeValues(startIndex: pagingParams.startIndex, pageSize: pagingParams.pageSize, sortBy:null,
                filter: extFilter.ToFilterString(), targetContextLevel: TargetContextLevel)).ReadAsSync();

            var items = attrs.Items.Select(Mapper.Map<DC.ReportAttributeValue, JObject>).Where(x => x != null).ToList();
            return List2(items, attrs.TotalCount);
        }

        [HttpPostRoute(UriTemplate = "attributevalues/edit")]
        public async Task<Response<JObject>> UpsertLocalizedAttributeValues(JObject jObject)
        {
            var localizedAttrValue = jObject.ToObject<LocalizedAttributeValue>();
            var attrLocalizedContent = (from supportedLocale in localizedAttrValue.SupportedLocales
                                    let localizedName = (string)jObject["value_" + supportedLocale]
                                    where ! string.IsNullOrEmpty(localizedName)
                                    select new DC.AttributeVocabularyValueLocalizedContent
                                    {
                                        LocaleCode = supportedLocale,
                                        StringValue = localizedName
                                    }).ToList();

            var updatedResults = (await _attributeWebApiClient.UpdateAttributeVocabularyValueLocalizedContents(attrLocalizedContent, localizedAttrValue.AttributeFQN, 
                localizedAttrValue.AttributeName, responseFields: null, targetContextLevel: TargetContextLevel)).ReadAsSync();

            var jResult = ReportLocalizedConverterHelper.AddLocalizedValues("value_", localizedAttrValue, updatedResults, (property, locales) => property.SupportedLocales = locales,
                rptContent => rptContent.LocaleCode, rptContent => rptContent.StringValue, localizedAttrValue.LocaleCode, localizedAttrValue.SupportedLocales);

            return Single2(jResult);
        } 

        [HttpGetRoute(UriTemplate = "productproperties/read")]
        public async Task<Response<List<JObject>>> GetLocalizedProductProperties([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            if (!_apiCtx.MasterCatalogId.HasValue)
            {
                return List2(new List<JObject>(), 0);
            }

            var attrs = (await _reportWebApiClient.GetProductProperties(startIndex: pagingParams.startIndex, pageSize: pagingParams.pageSize,
                filter: extFilter.ToFilterString(), targetContextLevel: TargetContextLevel)).ReadAsSync();

            var items = attrs.Items.Select(Mapper.Map<DC.ReportProductProperty, JObject>).Where(x => x != null).ToList();
            return List2(items, attrs.TotalCount);
        }

        [HttpPostRoute(UriTemplate = "productproperties/edit")]
        public async Task<Response<JObject>> UpsertLocalizedProductProperties(JObject jObject)
        {
            var localizedProp = jObject.ToObject<LocalizedProductProperty>();
            var localizedContent = (from supportedLocale in localizedProp.SupportedLocales
                                    let localizedName = (string)jObject["value_" + supportedLocale]
                                    where !string.IsNullOrEmpty(localizedName)
                                    select new DC.ProductPropertyValueLocalizedContent
                                    {
                                        LocaleCode = supportedLocale,
                                        StringValue = localizedName,
                                    }).ToList();
            var updatedResults = (await _productWebApiClient.UpdatePropertyValueLocalizedContents(localizedContent, productCode: localizedProp.ProductCode, attributeFQN: localizedProp.AttributeFQN,
                value: localizedProp.CanonicalValue, targetContextLevel: TargetContextLevel)).ReadAsSync();
            var jResult = ReportLocalizedConverterHelper.AddLocalizedValues("value_", localizedProp, updatedResults, (property, locales) => property.SupportedLocales = locales,
                rptContent => rptContent.LocaleCode, rptContent => rptContent.StringValue, localizedProp.LocaleCode, localizedProp.SupportedLocales);
            
            return Single2(jResult);
        } 
        
        [HttpGetRoute(UriTemplate = "productextras/read")]
        public async Task<Response<List<JObject>>> GetLocalizedProductExtras([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            if (!_apiCtx.MasterCatalogId.HasValue)
            {
                return List2(new List<JObject>(), 0);
            }

            var productExtras = (await _reportWebApiClient.GetProductExtras(startIndex: pagingParams.startIndex, pageSize: pagingParams.pageSize,
                filter: extFilter.ToFilterString(), targetContextLevel: TargetContextLevel)).ReadAsSync();

            var items = productExtras.Items.Select(Mapper.Map<DC.ReportProductExtra, JObject>).Where(x => x != null).ToList();
            return List2(items, productExtras.TotalCount);   
        }

        [HttpPostRoute(UriTemplate = "productextras/edit")]
        public async Task<Response<JObject>> UpsertLocalizedProductExtras(JObject jObject)
        {
            var extraPrice = jObject.ToObject<LocalizedProductExtraPrice>();
            var localizedPrices = (from supportedCurrency in extraPrice.SupportedCurrencies
                                   let localizedPrice = (decimal?)jObject["price_" + supportedCurrency]
                                   where localizedPrice != null
                                   select new DC.ProductExtraValueDeltaPrice
                                   {
                                       CurrencyCode = supportedCurrency,
                                       DeltaPrice = localizedPrice.GetValueOrDefault()
                                   }).ToList();

            var updatedResults = (await _productWebApiClient.UpdateExtraValueLocalizedDeltaPrices(localizedPrices, extraPrice.ProductCode, extraPrice.AttributeFQN, 
                value: string.IsNullOrEmpty(extraPrice.AttributeName) ? "null" : extraPrice.AttributeName,
                responseFields: null, targetContextLevel: TargetContextLevel)).ReadAsSync();
            var jResult = ReportLocalizedConverterHelper.AddLocalizedPrices(extraPrice, updatedResults);
            return Single2(jResult);
        } 
        
        [HttpGetRoute(UriTemplate = "productvariants/read")]
        public async Task<Response<List<JObject>>> GetLocalizedProductVariants([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            if (!_apiCtx.MasterCatalogId.HasValue)
            {
                return List2(new List<JObject>(), 0); 
            }

            var productVariants = (await _reportWebApiClient.GetProductVariations(startIndex: pagingParams.startIndex, pageSize: pagingParams.pageSize,
                filter: extFilter.ToFilterString(), targetContextLevel: TargetContextLevel)).ReadAsSync();

            var items = productVariants.Items.Select(Mapper.Map<DC.ReportProductVariation, JObject>).Where(x => x != null).ToList();
            return List2(items, productVariants.TotalCount);            
        }

        [HttpPostRoute(UriTemplate = "productvariants/edit")]
        public async Task<Response<JObject>> UpsertLocalizedProductVariants(JObject jObject)
        {
            var variantPrice = jObject.ToObject<LocalizedProductVariantPrice>();
            var localizedDeltaPrices = (from supportedCurrency in variantPrice.SupportedCurrencies
                                    let localizedPrice = (decimal?)jObject["price_" + supportedCurrency]
                                    let localizedMsrp = (decimal?)jObject["msrp_" + supportedCurrency]
                                    let localizedCredit = (decimal?)jObject["credit_" + supportedCurrency]
                                    where ((localizedPrice != null && localizedPrice.HasValue) 
                                        || (localizedMsrp != null && localizedMsrp.HasValue) 
                                        || (localizedCredit != null && localizedCredit.HasValue))
                                    select new DC.ProductVariationDeltaPrice
                                    {
                                        CurrencyCode = supportedCurrency,
                                        Value = localizedPrice,
                                        MSRP = localizedMsrp,
                                        CreditValue = localizedCredit
                                    }).ToList();

            var updatedResults = (await _productWebApiClient.UpdateProductVariationLocalizedDeltaPrices(localizedDeltaPrices, productCode:variantPrice.ParentProductCode, 
                variationKey:variantPrice.VariationKey, targetContextLevel: TargetContextLevel)).ReadAsSync();

            var jResult = ReportLocalizedConverterHelper.AddLocalizedPrices(variantPrice, updatedResults);
            return Single2(jResult);
        }

    }
}