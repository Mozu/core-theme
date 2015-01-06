using System;
using System.Collections;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Caching;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;

namespace Mozu.SiteBuilder.UX.Hypr.Tags
{
    /// <summary>
    /// The include_products tag is a special kind of include tag, that includes a named template, 
    /// but also sets that template's Model to be a list of products. 
    /// This is useful on category pages, featured products widgets, 
    /// and any number of other uses. 
    /// 
    /// It has a number of extra argumentss:
    /// 
    /// 
    /// viewName=the path to the template
    /// 
    /// includeFacets=Set this to true to add a list of available Facets to the Model, 
    /// which is necessary when building a faceted, drill-down UI. 
    /// The Model will have a Facets list. Default false.
    /// 
    /// pageWithUrl=Set this to true to use URL parameters for paging. 
    /// If this is true then the list will use StartIndex and PageSize parameters in the URL if they exist. 
    /// Default false.
    /// 
    /// sortWithUrl=Set this to true to use URL parameters for sorting. 
    /// If this is true then the list will use SortAsc or SortDesc parameters in the URL if they exist.
    /// 
    /// startIndex=refer to product api documentation
    /// 
    /// pageSize=refer to product api documentation
    /// 
    /// query=refer to product api documentation
    /// 
    /// sort=refer to product api documentation
    /// 
    /// productCodes=alternate to query.  An array of product codes
    /// </summary>
    [NDjango.ParserNodes.Description("tbd")]
    [NDjango.Interfaces.Name("include_products")]
    public class IncludeProductsTag : SimpleTagBaseAsync
    {
        protected override async Task<ProcessTagResult> ProcessTagAsync(ArgumentCollection arguments, NDjango.Interfaces.IContext context)
        {
            var result = new ProcessTagResult(context);
            var cache = context.Resolve<IStorefrontCache>();

            var template = arguments.GetValueOrDefault<string>("viewName") ?? (string)arguments[0].Value;
            var includeFacets = arguments.GetValueOrDefault("includeFacets", false);
            var pageWithUrl = arguments.GetValueOrDefault("pageWithUrl", false);
            var sortWithUrl = arguments.GetValueOrDefault("sortWithUrl", false);
            var startIndex = arguments.GetValueOrDefault("startIndex", 0);
            var pageSize = arguments.GetValueOrDefault("pageSize", 15);
            var query = arguments.GetValueOrDefault<string>("query");
            var sort = arguments.GetValueOrDefault<string>("sort");
            var productCodes = arguments.GetValueOrDefault<IEnumerable>("productCodes");


            var pageContext = context.PageContext();
            var siteContext = context.SiteContext();
            var searchWebApiClient = context.Resolve<IProductSearchWebApiClient>();
            var request = context.HttpContext().Request;
            var searchQuery = new StringBuilder();
            string facetTemplate = null;

            string facetValueFilter = null;
            string facetHierValue = null;
            string facetHierDepth = null;
            var categoryId = pageContext.CategoryId;
            var defaultQuery = "*:*";
            string[] productCodesFilters = null;

            if (query != null)
            {
                searchQuery.Append(query);
            }
            else if (productCodes != null)
            {
                if (productCodes is string)
                {
                    productCodes = ((string)productCodes).Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
                }

                productCodesFilters = (productCodes).Cast<object>().Where(x => x != null).Select(x => string.Format("productCode eq {0}", x)).ToArray();

                if (productCodesFilters.Length == 0)
                {
                    result.Template = null;
                    return result;
                }
                else
                {
                    searchQuery.Append(string.Join(" or ", productCodesFilters));
                }
            }
            else
            {
                if (categoryId.HasValue)
                {
                    searchQuery.Append("categoryId req ");
                    searchQuery.Append(categoryId.Value);
                }
            }

            if (pageWithUrl)
            {
                int tmp;
                if (int.TryParse(request["pageSize"], out tmp))
                {
                    pageSize = tmp;
                }
                else if (int.TryParse((siteContext.ThemeSettings["defaultPageSize"] ?? new object()).ToString(), out tmp))
                {
                    pageSize = tmp;
                }
                else
                {
                    pageSize = 15;
                }

                if (int.TryParse(request["startIndex"], out tmp))
                {
                    startIndex = tmp;
                }
            }
            
            if (includeFacets && categoryId.HasValue)
            {
                facetHierDepth = "categoryId:2";
                facetTemplate = "categoryId:" + categoryId;
                facetHierValue = "categoryId:" + categoryId;
                facetValueFilter = request.QueryString["facetValueFilter"];
            }

            var sortBy = (siteContext.ThemeSettings["defaultSort"] ?? "").ToString();

            if (sortWithUrl && !string.IsNullOrEmpty(request["sortBy"]))
            {
                sortBy = request["sortBy"];
            }

            var filter = searchQuery.ToString();
            var cacheKey = new StringBuilder().Append(defaultQuery).Append(filter).Append(facetHierValue).Append(facetTemplate).Append(facetHierDepth).Append(facetValueFilter).Append(startIndex).Append(sortBy).Append(pageSize).ToString();

            var pc = cache.Get<ProductSearchResult>(cacheKey);
            if (pc == null)
            {
                var res = await searchWebApiClient.Search(query: defaultQuery, filter: filter, facetHierValue: facetHierValue, facetTemplate: facetTemplate, facetHierDepth: facetHierDepth, facetValueFilter: facetValueFilter, startIndex: startIndex, sortBy: sortBy, pageSize: pageSize).ConfigureAwait(false);
                using (var stream = await res.ResponseMessage.Content.ReadAsStreamAsync())
                {
                    using (var rdr = System.Web.Http.GlobalConfiguration.Configuration.Formatters.JsonFormatter.CreateJsonReader(typeof(ProductSearchResult), stream, Encoding.UTF8))
                    {
                        var ser = System.Web.Http.GlobalConfiguration.Configuration.Formatters.JsonFormatter.CreateJsonSerializer();
                        pc = ser.Deserialize<ProductSearchResult>(rdr);
                        
                        if (productCodesFilters != null && productCodesFilters.Length > 0 && pc.Items != null )
                        {
                            pc.Items = productCodes.Cast<string>().Select(x => pc.Items.FirstOrDefault(y => y.ProductCode.Equals(x, StringComparison.OrdinalIgnoreCase)))
                                .Where(x => x != null).ToList();
                        }
                    }
                }
                cache.Set(cacheKey, pc);
            }
            result.Template = template;
            result.Context = context.add(new Tuple<string, object>("model", pc));
            return result;
        }
    }
}