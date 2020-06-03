using System;
using System.Collections.Generic;
using Mozu.Core.Api.Client;
using Mozu.SiteBuilder.Mvc.Extensions;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core;
using Mozu.Core.Api.Routing;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.ProductRuntime.Contracts;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Storefront;
using Mozu.SiteBuilder.UX.Admin.Helpers.ProductRuntimeHelpers;
using Newtonsoft.Json.Linq;
using System.Linq;

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
            optionMapping(jobj);

            return Single2(jobj);
        }

        [HttpPostRoute(UriTemplate = "preview")]
        public async Task<Response<List<StorefrontProduct>>> PreviewExpressionProducts(ProductRuntimePreviewArgs inputArgs)
        {
            string keywords = string.Empty;
            int siteId = (inputArgs?.siteId).GetValueOrDefault(0);
            var start = (inputArgs?.start).GetValueOrDefault(0);
            var pageSize = (inputArgs?.limit).GetValueOrDefault(0);
            string sortString = _sortExpressionBuilder.Value.GetFromSortString(inputArgs?.sort);
            if (!string.IsNullOrWhiteSpace(inputArgs?.advancedSearch))
            {
                var values = (JObject)Newtonsoft.Json.JsonConvert.DeserializeObject(inputArgs.advancedSearch);
                foreach (var kvp in values)
                {
                    if (kvp.Key == "keyword")
                        keywords = (string)kvp.Value;
                }
            }
            var client = _productSearchWebApiClient.Value.CloneWithApiContext(context =>
            {
                context.SiteId = siteId;
                context.DataViewMode = FastEnum<DataViewModeType>.Parse(inputArgs?.dataViewMode);
                context.PreviewDate = inputArgs?.previewDate;
            });

            var products = (await client.Search(keywords, inputArgs?.expression, pageSize: pageSize, sortBy: sortString, startIndex: start)).ReadAsSync();

            var mapped = products.Items.Map<List<StorefrontProduct>>();
            return List2(mapped, products.TotalCount);
        }

        [HttpPostRoute(UriTemplate = "configure")]
        public async Task<Response<JObject>> Configure([FromBody] ProductOptionSelections selections,
            [FromUri] string productCode, [FromUri] int? quantity = null)
        {
            var res = (await _productRuntimeWebApiClient.Value.ConfiguredProduct(selections, productCode, true, quantity: quantity)).ReadAsSync();
            var jobj = JObject.FromObject(res);
            optionMapping(jobj);

            return Single2(jobj);
        }

        private void optionMapping(JObject jobj)
        {
            jobj.TryGetValue("Options", out var options);
            if (options != null)
            {
                var optionsJArray = options.ToJArray();
                if (optionsJArray.Count() > 0)
                {
                    foreach (var option in optionsJArray)
                    {
                        option["AttributeFQN"] = option.Value<string>("attributeFQN");
                        option["attributeFQN"].Parent.Remove();
                    }
                    jobj["Options"] = optionsJArray;
                }
            }
        }
    }

    /// <summary>
    ///     Used as input arguments for the Product-Runtime Preview
    /// </summary>
    public class ProductRuntimePreviewArgs
    {
        public string expression { get; set; }
        public string advancedSearch { get; set; }
        public int siteId { get; set; }
        public int? limit { get; set; }
        public int? start { get; set; }
        public int? page { get; set; }
        public string sort { get; set; }
        public string dataViewMode { get; set; }
        public DateTime? previewDate { get; set; }
    }

}