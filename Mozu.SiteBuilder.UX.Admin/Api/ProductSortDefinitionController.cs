using System;
using System.Collections.Generic;
using Mozu.Core.Api.Client;
using Mozu.SiteBuilder.Mvc.Extensions;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Core;
using Mozu.Core.Api.Routing;
using Mozu.ProductRuntime.Contracts.Clients;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Mozu.SiteBuilder.UX.Admin.Helpers.ProductSortDefinitionHelpers;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductSortDefinitions;
using PR = Mozu.ProductRuntime.Contracts;
using System.Linq;
using System.Web.Http;
using Mozu.Core.EnsureThat;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/productsortdefinition", SuppressDescriptorGeneration = true)]
    public class ProductSortDefinitionController : BaseController
    {
        #region Constructor and Private Fields

        private readonly IProductSearchWebApiClient _productSearchWebApiClient;
        private readonly IProductSortDefinitionWebApiClient _productSortDefinitionWebApiClient;
        private const int MAX_PAGE_SIZE = 100;

        public ProductSortDefinitionController(IProductSortDefinitionWebApiClient productSortDefinitionWebApiClient,
            IProductSearchWebApiClient productSearchWebApiClient)
        {
            _productSearchWebApiClient = productSearchWebApiClient;
            _productSortDefinitionWebApiClient = productSortDefinitionWebApiClient;
        }

        #endregion Constructor and Private Fields

        #region CRUD operations

        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<ProductSortDefinition>>> List([FromUri] PagingParamaters pagingParams,
            [FromUri] FilterCollection filterCollection)
        {
            if (pagingParams.id != null)
            {
                int productSortDefinitionId;
                var result = int.TryParse(pagingParams.id, out productSortDefinitionId);
                if (result)
                {
                    return await GetSingleProductSortDefinition(productSortDefinitionId);
                }

                return EmptySingle2<List<ProductSortDefinition>>(false);
            }

            var startIndex = pagingParams.startIndex.GetValueOrDefault(0);
            var pageSize = pagingParams.pageSize.GetValueOrDefault(200);
            var filter = filterCollection.ToFilterString();

            var sortBy = pagingParams.sort.ToSortString();
            if (string.IsNullOrEmpty(sortBy))
            {
                sortBy = "createdate desc";
            }

            var dcProductSortDefinitions =
                (await _productSortDefinitionWebApiClient.GetProductSortDefinitions(
                    startIndex: startIndex,
                    pageSize: pageSize,
                    filter: filter,
                    sortBy: sortBy))
                .ReadAsSync();

            var mappedDefinitions = Mapper.Map<List<ProductSortDefinition>>(dcProductSortDefinitions.Items);
            return List2(mappedDefinitions, dcProductSortDefinitions.TotalCount);
        }

        private async Task<Response<List<ProductSortDefinition>>> GetSingleProductSortDefinition(
            int productSortDefinitionId)
        {
            var response = (await _productSortDefinitionWebApiClient.GetProductSortDefinition(productSortDefinitionId))
                .ReadAsSync();

            var mappedResponse = Mapper.Map<ProductSortDefinition>(response);
            return List2(mappedResponse);
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<ProductSortDefinition>> Create(ProductSortDefinition productSortDefinition)
        {
            if (productSortDefinition.StartDate == null)
            {
                productSortDefinition.StartDate = DateTime.UtcNow;
            }

            ValidateProductSortDefinition(productSortDefinition);

            var dcDefinition = Mapper.Map<DC.ProductSortDefinition>(productSortDefinition);
            var response =
                (await _productSortDefinitionWebApiClient.AddProductSortDefinition(dcDefinition)).ReadAsSync();

            var mappedResponse = Mapper.Map<ProductSortDefinition>(response);
            return Single2(mappedResponse);
        }

        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<ProductSortDefinition>> Edit(ProductSortDefinition productSortDefinition)
        {
            Ensure.That(productSortDefinition.Id, "id").IsNotNull();
            ValidateProductSortDefinition(productSortDefinition);

            var dcDefinition = Mapper.Map<DC.ProductSortDefinition>(productSortDefinition);
            var response = (await _productSortDefinitionWebApiClient.UpdateProductSortDefinition(dcDefinition,
                dcDefinition.ProductSortDefinitionId)).ReadAsSync();

            var mappedResponse = Mapper.Map<ProductSortDefinition>(response);
            return Single2(mappedResponse);
        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<ProductSortDefinition>> DeleteProductSortDefinition(
            List<ProductSortDefinition> productSortDefinitions)
        {
            productSortDefinitions.ForEach(p => Ensure.That(p.Id, "id").IsNotNull());

            var tasks = productSortDefinitions
                .Select(p => _productSortDefinitionWebApiClient.DeleteProductSortDefinition(p.Id))
                .ToList();

            await Task.WhenAll(tasks);
            tasks.Select(TaskHelper.Result).ThrowExceptionsIfAny();

            return SuccessWithTotal2<ProductSortDefinition>(productSortDefinitions.Count);
        }

        private static void ValidateProductSortDefinition(ProductSortDefinition productSortDefinition)
        {       
            Ensure.That(productSortDefinition.Name, "name").IsNotNullOrEmpty();
            Ensure.That(productSortDefinition.StartDate, "startdate").IsNotNull();
            Ensure.That(productSortDefinition.CategoryId, "categoryid").IsNotNull();

            ProductSortDefinitionHelper.ValidateSortDefinition(productSortDefinition);
        }

        #endregion

        [HttpPostRoute(UriTemplate = "preview")]
        public async Task<Response<List<ProductSortDefinitionPreviewProduct>>> PreviewSortDefinitionProducts(
            ProductSortDefinitionPreviewArgs inputArgs)
        {
            var start = (inputArgs?.start).GetValueOrDefault(0);
            var pageSize = (inputArgs?.limit).GetValueOrDefault(MAX_PAGE_SIZE);

            var siteId = (inputArgs?.siteId).GetValueOrDefault(0);
            Ensure.That(siteId).IsGt(0);

            var inputSortDefinition = inputArgs?.SortDefinition;

            ProductSortDefinitionHelper.ValidateSortDefinition(inputSortDefinition);

            var runtimeSortDef = ProductSortDefinitionHelper.MapFrontEndToRuntime(inputSortDefinition);

            //Get results from runtime controller with Solr results
            var client = _productSearchWebApiClient.CloneWithApiContext(context =>
            {
                context.SiteId = siteId;
                context.DataViewMode = FastEnum<DataViewModeType>.Parse(inputArgs?.dataViewMode);
            });

            var runtimeSolrResultsRaw = (await client.SearchWithDefinition(
                runtimeSortDef,
                filter: $"categoryId req {inputSortDefinition?.CategoryId}",
                pageSize: pageSize,
                startIndex: start,
                responseFields:"items(productCode,content(productName,productImages),"+
                               "options,productType,price,priceRange,sliceValue,slicingAttributeFQN)"
                )).ReadAsAsync().Result;

            var returnResults = ProductSortDefinitionHelper.MapRuntimeToFrontEnd(runtimeSolrResultsRaw.Items, inputSortDefinition, runtimeSortDef);

            var returnCount = (returnResults.Count < pageSize && start == 0)
                ? returnResults.Count
                : runtimeSolrResultsRaw.TotalCount; 

            return List2(returnResults, returnCount);
        }
    }

    /// <summary>
    ///     Input arguments for the Product-Runtime Preview
    /// </summary>
    public class ProductSortDefinitionPreviewArgs
    {
        public int categoryId { get; set; }
        public int siteId { get; set; }
        public int? limit { get; set; }
        public int? start { get; set; }
        public int? page { get; set; }
        public string dataViewMode { get; set; }
        public ProductSortDefinition SortDefinition { get; set; }
    }

}