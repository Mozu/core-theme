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
using Microsoft.FSharp.Text.StructuredFormat;
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
        private readonly IMasterCatalogWebApiClient _masterCatalogWebApiClient;
        private readonly ISettings _settings;
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


        public LocalizedContentController(IAttributeWebApiClient attributeWebApiClient, IProductWebApiClient productWebApiClient, IReportWebApiClient reportWebApiClient, IMasterCatalogWebApiClient masterCatalogWebApiClient,
            ISettings settings, IApiContext apiCtx)
        {
            _attributeWebApiClient = attributeWebApiClient;
            _productWebApiClient = productWebApiClient;
            _reportWebApiClient = reportWebApiClient;
            _masterCatalogWebApiClient = masterCatalogWebApiClient;
            _settings = settings;
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

            // real code
            var attrs = (await _reportWebApiClient.GetAttributes(startIndex: pagingParams.startIndex, pageSize: pagingParams.pageSize,
                filter: extFilter.ToFilterString(), targetContextLevel: TargetContextLevelType.MasterCatalog)).ReadAsSync();

            var items = attrs.Items.Select(Mapper.Map<DC.ReportAttribute, JObject>).Where(x => x != null).ToList();
            return List2(items, attrs.TotalCount);

        }

        [HttpPostRoute(UriTemplate = "attributes/edit")]
        public async Task<Response<JObject>> UpsertLocalizedAttributes(JObject jObject)
        {
            //var fakeData = CreatFakeJAttrib("Size", "Dimension3", "размер");
            //var result = await Task.FromResult(fakeData);
            //return Single2(result);

            //real code
            var attr = jObject.ToObject<LocalizedAttribute>();
            var localizedContent = (from supportedLocale in attr.SupportedLocales
                                    let localizedName = (string)jObject[supportedLocale + "_name"]
                                    where localizedName != null
                                    select new DC.AttributeLocalizedContent
                                    {
                                        LocaleCode = supportedLocale,
                                        Name = localizedName
                                    }).ToList();

            var updatedResults = (await _attributeWebApiClient.UpdateLocalizedContents(localizedContent, attr.AttributeFQN, responseFields:null, targetContextLevel: TargetContextLevelType.MasterCatalog)).ReadAsSync();
            var jResult = ReportLocalizedConverterHelper.AddLocalizedNames(attr, updatedResults);
            return Single2(jResult);
        }

        [HttpGetRoute(UriTemplate = "attributevalues/read")]
        public async Task<Response<List<JObject>>> GetLocalizedAttributeValues([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            //var attrValues = (await _reportWebApiClient.GetAttributeValuess(startIndex: pagingParams.startIndex, pageSize: pagingParams.pageSize,
            //    filter: extFilter.query, targetContextLevel: TargetContextLevelType.MasterCatalog)).ReadAsSync();

            // todo: automapper - Greg Murray on 2014-07-13 
            throw new NotImplementedException();
        }

        [HttpPostRoute(UriTemplate = "attributevalues/edit")]
        public async Task<Response<JObject>> UpsertLocalizedAttributeValues(JObject jObject)
        {
            //await _attributeWebApiClient.UpdateAttributeVocabularyValueLocalizedContents()
            throw new NotImplementedException();
        } 

        [HttpGetRoute(UriTemplate = "product/properties/read")]
        public async Task<Response<List<JObject>>> GetLocalizedProductProperties([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            throw new NotImplementedException();
        }

        [HttpPostRoute(UriTemplate = "product/properties/edit")]
        public async Task<Response<JObject>> UpsertLocalizedProductProperties(JObject jObject)
        {
            //await _productWebApiClient.UpdatePropertyValueLocalizedContents();
            throw new NotImplementedException();
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

                                   //where localizedPrice != null
                                   select new DC.ProductExtraValueDeltaPrice
                                   {
                                       CurrencyCode = supportedCurrency,
                                       DeltaPrice = localizedPrice.GetValueOrDefault()
                                   }).ToList();

            var updatedResults = (await _productWebApiClient.UpdateExtraValueLocalizedDeltaPrices(localizedPrices, extraPrice.ProductCode, extraPrice.AttributeFQN,
                responseFields: null, targetContextLevel: TargetContextLevel, value: extraPrice.AttributeName)).ReadAsSync();
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
            
            //var fakeData = CreateFakeVariantData();
            //var result = await Task.FromResult(fakeData);
            //return List2(result, 4);

        }

        [HttpPostRoute(UriTemplate = "productvariants/edit")]
        public async Task<Response<JObject>> UpsertLocalizedProductVariants(JObject jObject)
        {
            var variantPrice = jObject.ToObject<LocalizedProductVariantPrice>();
            var localizedPrices = (from supportedCurrency in variantPrice.SupportedCurrencies
                                    let localizedPrice = (decimal?)jObject["price_" + supportedCurrency]
                                    let localizedMsrp = (decimal?)jObject["msrp_" + supportedCurrency]
                                    let localizedCredit = (decimal?)jObject["credit_" + supportedCurrency]
                                    //where localizedPrice != null
                                    select new DC.ProductVariationDeltaPrice
                                    {
                                        CurrencyCode = supportedCurrency,
                                        Value = localizedPrice,
                                        MSRP = localizedMsrp,
                                        CreditValue = localizedCredit
                                    }).ToList();

            var updatedResults = (await _productWebApiClient.UpdateProductVariationLocalizedDeltaPrices(localizedPrices, variantPrice.ParentProductCode, 
                responseFields: null, targetContextLevel: TargetContextLevel, variationKey:variantPrice.VariantProductCode)).ReadAsSync();
            var jResult = ReportLocalizedConverterHelper.AddLocalizedPrices(variantPrice, updatedResults);
            return Single2(jResult);
        }


        #region privates



        private List<JObject> CreateFakeVariantData()
        {
            var result = new List<JObject>();

            result.Add(CreatFakeJVariant("T-Shirt", "Black", "S", 9.95M, 11.95M));
            result.Add(CreatFakeJVariant("T-Shirt", "Yello", "M", 9.95M, 11.95M));
            result.Add(CreatFakeJVariant("T-Shirt", "Blue", "XL", 11.95M, 14.95M));
            result.Add(CreatFakeJVariant("T-Shirt", "Green", "XXXXXL", 9999.99M, 11000.00M));
            return result;
        }

        private JObject CreatFakeJVariant(string name, string color, string size, decimal price, decimal msrp)
        {
            const decimal euroX = 0.74M;
            const decimal rubX = 35M;
            var attrib = new LocalizedProductVariantPrice
            {
                VariantProductCode = Guid.NewGuid().ToString("N").Substring(0, 8),
                ParentProductCode = Guid.NewGuid().ToString("N").Substring(0, 6),
                ProductName = name,
                Options = new List<string>
                    {
                        "color - "+ color, "size - " +size
                    },
                CurrencyCode = "USD",
                DeltaPrice = price,
                DeltaCreditValue = null,
                DeltaMSRP = msrp,
                SupportedCurrencies = new List<string> { "EUR", "RUB"}
            };
            var j = JObject.FromObject(attrib, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings()));
            j["price_EUR"] = price*euroX;
            j["msrp_EUR"] = msrp*euroX;
            j["credit_EUR"] = "";
            j["price_RUB"] = price * rubX;
            j["msrp_RUB"] = msrp * rubX;
            j["credit_RUB"] = "";

            return j;
        }


        //private List<JObject> CreateFakeAttributeJData()
        //{
        //    var result = new List<JObject>();

        //    result.Add(CreatFakeJAttrib("Color", "Coleur", "цвет"));
        //    result.Add(CreatFakeJAttrib("Size", "Dimension", "размер"));
        //    result.Add(CreatFakeJAttrib("Material", "matériel", "материал"));
        //    result.Add(CreatFakeJAttrib("Weight", "poids", "вес"));
        //    return result;
        //}

        //private JObject CreatFakeJAttrib(string attr, string attrFr, string attrRu)
        //{
        //    var attrib = new LocalizedAttribute
        //    {
        //        AdminName = attr,
        //        AttributeFQN = "Tenant~" + attr,
        //        Description = attr,
        //        Locale = "en-US",
        //        Name = attr,
        //        SupportedLocales = new List<string> { "fr-FR","ru-RU"}
        //    };
        //    var j = JObject.FromObject(attrib, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings()));
        //    j["fr-FR_name"] = attrFr;
        //    j["ru-RU_name"] = attrRu;
        //    return j;
        //}
        

        #endregion


    }
}