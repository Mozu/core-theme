using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.Core.Api.Client;
using Mozu.SiteBuilder.Mvc.Extensions;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Routing;
using Mozu.Core.Extensions;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.ProductRuntime.Contracts;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Storefront;
using Mozu.SiteBuilder.UX.Admin.Helpers.ProductRuntimeHelpers;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/productruntime", SuppressDescriptorGeneration = true)]
    public class ProductRuntimeController : BaseController
    {
        private readonly IApiContext _context;
        private readonly Lazy<ICategoryWebApiClient> _categoryWebApiClient;
        private readonly Lazy<IProductRuntimeWebApiClient> _productRuntimeWebApiClient;
        private readonly Lazy<IProductSearchWebApiClient> _productSearchWebApiClient;
        private readonly Lazy<IProductRuntimeSortExpressionBuilder> _sortExpressionBuilder;

        public ProductRuntimeController(
            IApiContext context,
            Lazy<ICategoryWebApiClient> categoryWebApiClient, 
            Lazy<IProductSearchWebApiClient> productSearchWebApiClient,
            Lazy<IProductRuntimeWebApiClient> productRuntimeWebApiClient,
            Lazy<IProductRuntimeSortExpressionBuilder> sortExpressionBuilder)
        {
            _productRuntimeWebApiClient = productRuntimeWebApiClient;
            _productSearchWebApiClient = productSearchWebApiClient;
            _sortExpressionBuilder = sortExpressionBuilder;
            _context = context;
            _categoryWebApiClient = categoryWebApiClient;
        }

        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<JObject>> GetProduct(string productCode)
        {
            var prod = (await _productRuntimeWebApiClient.Value.GetProduct(productCode)).ReadAsSync();

            var jobj = JObject.FromObject(prod);
            return Single2(jobj);
        }

        [HttpGetRoute(UriTemplate = "preview")]
        public async Task<Response<List<StorefrontProduct>>> PreviewExpressionProducts(
            PagingParamaters pagingParams,
            FilterCollection extFilter,
            string expression, 
            int siteId, 
            string dataViewMode, 
            DateTime? previewDate = null)
        {
            var start = pagingParams != null ? pagingParams.startIndex : 0;
            var pageSize = pagingParams != null ? pagingParams.pageSize : 25;
            var sort = (pagingParams != null && pagingParams.sort != null) ? _sortExpressionBuilder.Value.ToSortString(pagingParams.sort) : null; 

            var client = _productSearchWebApiClient.Value.CloneWithApiContext(context =>
            {
                context.SiteId = siteId;
                context.DataViewMode = FastEnum<DataViewModeType>.Parse(dataViewMode);
                context.PreviewDate = previewDate;
            });

            string keywords = string.Empty;
            //FilterCollection actually contains any keywords typed in so unwind those
            if (!extFilter.IsNullOrEmpty())
            {
                var keywordEntry = extFilter.FirstOrDefault(f => f.field.EqualsIgnoreCase("all"));
                if (keywordEntry != null)
                {
                    keywords = (string) keywordEntry.value;
                }
            }

            var prod = (await client.Search(keywords, expression, pageSize:pageSize, sortBy:sort, startIndex:start)).ReadAsSync();

            var mapped = prod.Items.Map<List<StorefrontProduct>>();
            return List2(mapped, prod.TotalCount);
        }


        [HttpPostRoute(UriTemplate = "configure")]
        public async Task<Response<JObject>> Configure([FromBody] ProductOptionSelections selections,
            [FromUri] string productCode)
        {
            var res = (await _productRuntimeWebApiClient.Value.ConfiguredProduct(selections, productCode, true)).ReadAsSync();
            var jobj = JObject.FromObject(res);
            return Single2(jobj);
        }
    }
}