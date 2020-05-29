using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers.ProductVariationHelpers;
using Newtonsoft.Json;
using AutoMapper;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/productvariation", SuppressDescriptorGeneration = true)]
    public class ProductVariationController : BaseController
    {
        private readonly IProductWebApiClient _productClient;
        private readonly IProductTypeWebApiClient _productTypeWebApiClient;

        public ProductVariationController(IProductWebApiClient productClient,
            IProductTypeWebApiClient productTypeWebApiClient)
        {
            _productClient = productClient;
            _productTypeWebApiClient = productTypeWebApiClient;
        }

        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<ProductVariation>>> ListProducts([FromUri] PagingParamaters pagingParams,
            [FromUri] FilterCollection extFilter,
            [FromUri]string productCode = null,
            [FromUri] string options = null,
            [FromUri] int? productTypeId = null,
            [FromUri]string tempProductCode = null)
        {
            string extFitlerString = extFilter.ToFilterString();
            string filter = (!string.IsNullOrEmpty(extFitlerString)) ? extFitlerString + " and IsOrphan ne true" : "IsOrphan ne true";

            Mozu.ProductAdmin.Contracts.ProductVariationPagedCollection collection;

            if (!string.IsNullOrEmpty(options))
            {
                var productOptions = JsonConvert.DeserializeObject<List<ProductProperty>>(options);

                if (productOptions.Count == 0)
                {
                    collection = new DC.ProductVariationPagedCollection
                    {
                        Items = new List<DC.ProductVariation>(),
                        TotalCount = 0
                    };
                }
                else
                {
                    var dcOptions = Mapper.Map<List<Mozu.ProductAdmin.Contracts.ProductOption>>(productOptions);

                    if (pagingParams.pageSize >= 0)
                    {

                        collection = (await _productTypeWebApiClient
                            .GenerateProductVariations(productOptionsIn: dcOptions,
                                productTypeId: productTypeId ?? -1,
                                productCode: productCode,
                                startIndex: pagingParams.startIndex,
                                pageSize: pagingParams.pageSize,
                                filter: filter)).ReadAsSync();
                    }
                    else
                    {
                        //negative page size -> get all
                        var startIndex = pagingParams.startIndex ?? 0;
                        var pageSize = 1000;


                        var items = new List<DC.ProductVariation>();

                        do
                        {
                            //loop through until we have pulled all of them
                            collection = (await _productTypeWebApiClient
                                .GenerateProductVariations(productOptionsIn: dcOptions,
                                    productTypeId: productTypeId ?? -1,
                                    productCode: productCode,
                                    startIndex: startIndex,
                                    pageSize: pageSize,
                                    filter: filter)).ReadAsSync();


                            items.AddRange(collection.Items);

                            startIndex += pageSize;
                        }
                        while (items.Count < collection.TotalCount);

                        collection.Items = items;
                    }




                    //    string format = "000";
                    for (var i = 0; i < collection.Items.Count; i++)
                    {
                        var item = collection.Items[i];
                        if (!string.IsNullOrEmpty(tempProductCode))
                        {
                            item.VariationProductCode = tempProductCode + "-" + (i + 1).ToString("000");
                        }
                    }
                }
            }
            else
            {
                collection = (await _productClient
                    .GetProductVariations(productCode: productCode,
                        startIndex: pagingParams.startIndex,
                        pageSize: pagingParams.pageSize,
                        filter: filter)).ReadAsSync();
            }

            var mappedRes = Mapper.Map<List<ProductVariation>>(collection.Items);
            return List2(mappedRes, collection.TotalCount);
        }

        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<ProductVariation>>> EditVariations(List<ProductVariation> variations,
            [FromUri] string productCode)
        {
            var dcVariations = Mapper.Map<List<DC.ProductVariation>>(variations);
            var res = (await _productClient.UpdateProductVariations(
                new DC.ProductVariationCollection() { Items = dcVariations }, productCode)).ReadAsSync();
            var ret = Mapper.Map<List<ProductVariation>>(res.Items);
            return List2(ret);
        }
    }
}