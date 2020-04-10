using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Mozu.Core;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using NDjango.Interfaces;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Web;

namespace Mozu.SiteBuilder.Mvc.Helpers
{
    public class UrlHelper
    {
        public enum UrlType
        {
            Facet,
            Paging,
            Sorting,
            Image,
            Category,
            Product,
            Stylesheet,
            CDN,
            Document,
            Search,
            Cart,
            InStockLocation
        }

        private readonly ISiteBuilderApiContext _apiContext;
        private readonly ISiteContext _siteContext;
        private readonly IPageContext _pageContext;
        private readonly ICustomRouteHandler _customRouteHandler;
        private readonly HttpContext _context;
        private readonly Lazy<ICategoryTreeProvider> _categoryTreeProvider;

        public UrlHelper(ISiteContext siteContext,
            ISiteBuilderApiContext apiContext,
            IPageContext pageContext,
            ICustomRouteHandler customRouteHandler,
            HttpContext context,
            Lazy<ICategoryTreeProvider> categoryTreeProvider)
        {
            _apiContext = apiContext;
            _siteContext = siteContext;
            _pageContext = pageContext;
            _customRouteHandler = customRouteHandler;
            _context = context;
            _categoryTreeProvider = categoryTreeProvider;
        }

        private static readonly JsonCleaningCaseInsensitiveMemberResolver Resolver = new JsonCleaningCaseInsensitiveMemberResolver();

        //todo:cole add script support
        //[Microsoft.ClearScript.ScriptMember("getUrl")]
        public string MakeUrl(string type, object obj, DynamicObject config, string hostname = null)
        {
            if (!FastEnum<UrlType>.TryParse(type, out var urlType))
                throw new RenderingError(
                    $"unknown urltag type: {type}. Tags must be one of [{string.Join(",", Enum.GetNames(typeof(UrlType)).Select(x => x.ToLowerInvariant()))}]",
                    Microsoft.FSharp.Core.FSharpOption<Exception>.None);

            var dic = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
            foreach (var name in config.GetDynamicMemberNames())
            {
                if (config.TryGetMember(MyGetMemberBinder.Get(name), out var configValue))
                {
                    dic[name] = configValue;
                }
            }
            return MakeUrl(urlType, obj, dic, false, hostname);
        }

        class MyGetMemberBinder : GetMemberBinder
        {
            public static System.Collections.Concurrent.ConcurrentDictionary<string, MyGetMemberBinder> _cache = new System.Collections.Concurrent.ConcurrentDictionary<string, MyGetMemberBinder>();

            public static MyGetMemberBinder Get(string key)
            {
                return _cache.GetOrAdd(key, x => new MyGetMemberBinder(key, true));
            }
            private MyGetMemberBinder(string name, bool ignoreCase) : base(name, ignoreCase)
            {
            }

            public override DynamicMetaObject FallbackGetMember(DynamicMetaObject target, DynamicMetaObject errorSuggestion)
            {
                return null;
            }
        }
        public string MakeUrl(UrlType type, object obj, Dictionary<string, object> config, string hostname=null)
        {
            return MakeUrl(type, obj, config, false,hostname: hostname);
        }
        public string MakeUrl(UrlType type, object obj, Dictionary<string, object> config, bool includeContext, string hostname = null )
        {

            var url = "#";

            switch (type)
            {
                case UrlType.Facet:
                    {
                        url = MakeFacetUrl(obj, hostname);
                        break;
                    }
                case UrlType.Paging:
                    {
                        return MakePagingUrl(obj, config);
                    }
                case UrlType.Sorting:
                    {
                        return MakeSortingUrl(obj, config);
                    }
                case UrlType.InStockLocation:
                    {
                        return MakeInStockLocationUrl(obj, config);
                    }
                case UrlType.Image:
                    {
                        url = MakeImageUrl(obj, config);
                        break;
                    }
                case UrlType.Category:
                    {
                        url = MakeCategoryUrl(obj, config, includeContext, false, hostname);
                        break;
                    }
                case UrlType.Product:
                    {
                        url = MakeProductUrl(obj, config, hostname);
                        break;
                    }
                case UrlType.Stylesheet:
                    {
                        url = MakeStylesheetUrl(obj, config);
                        break;
                    }
                case UrlType.CDN:
                    {
                        url = MakeCdnUrl(obj, config);
                        break;
                    }
                case UrlType.Document:
                    {
                        url = MakeDocumentUrl(obj, config, hostname);
                        break;
                    }
                case UrlType.Search:
                    {
                        url = MakeSearchUrl(hostname);
                        break;
                    }
                case UrlType.Cart:
                    {
                        url = MakeCartUrl(hostname);
                        break;
                    }
            }
            return url;
        }

        private string MakeCartUrl(string hostName)
        {
            return _customRouteHandler.GetCanonicalUrl(FancyRoute.Cart, null, false, hostName:hostName) ?? "/cart";
        }

        private string MakeSearchUrl(string hostName)
        {
            return _customRouteHandler.GetCanonicalUrl(FancyRoute.Search, null, false, hostName:hostName) ?? "/search";
        }

        private string MakeStylesheetUrl(object obj, Dictionary<string, object> config)
        {

            config["SBTHEME"] = this._siteContext.Theme.Id;
           
            config["mzsh"] = _siteContext.HashString;

            if (this._apiContext.DataViewMode == Core.DataViewModeType.Pending)
            {
                config["dv"] = "p";
            }
            if (_pageContext.IsDebugMode || _apiContext.DebugFlags.HasFlag(DebugModeFlagValues.Unminified))
            {
                config["debug"] = true;
            }
            
            return MakeCdnUrl(obj, config);
            

        }
        string MakeDocumentUrl(object o, Dictionary<string, object> config, string hostName )
        {
            Mozu.Content.Contracts.Document doc = null;
            if (o is string)
            {
                doc = new Mozu.Content.Contracts.Document() { Name = (string)o };
                return DoMakeDocumentUrl(doc, config, hostName);

            }
            doc = o as Mozu.Content.Contracts.Document;
            if (doc != null)
            {
                return DoMakeDocumentUrl(doc, config, hostName);
            }

            var name = Resolver.ResolveMemberOrDefault<string>(o, "name", null);
            if (string.IsNullOrEmpty(name))
            {
                return "#";
            }
            doc = new Content.Contracts.Document()
            {
                Name = name,
                ListFQN = Resolver.ResolveMemberOrDefault<string>(o, "ListFQN", null),
                DocumentTypeFQN = Resolver.ResolveMemberOrDefault<string>(o, "DocumentTypeFQN", null),
                Properties = Resolver.ResolveMemberOrDefault<JObject>(0, "Properties")
            };

            return DoMakeDocumentUrl(doc, config,hostName);
        }

        string DoMakeDocumentUrl(Mozu.Content.Contracts.Document doc, Dictionary<string, object> config, string hostName)
        {
            return 
                _customRouteHandler.GetCanonicalUrl(FancyRoute.CmsPage, () => Mapper.Map<IDictionary<string, object>>(doc).ChainSet(config), false, hostName:hostName) ??
                (doc.ListFQN.EqualsIgnoreCase("pages@mozu") ? // the default routes for cms documents on the UX side are the source here.
                    "/" + doc.Name : // pages have a default route of /{documentName}
                    string.Format("/cms/{0}/{1}", doc.ListFQN, doc.Name) // all other documents have a default route of /cms/{doclistFQN}/{docName}
                );
        }

        private string MakeCdnUrl(object o, Dictionary<string, object> config)
        {

            var sb = new StringBuilder(o as string);
            var str = sb.ToString();

            if (string.IsNullOrEmpty(str))
            {
                return "#";
            }
            if (str[0] != '/' && str.IndexOf("http", StringComparison.OrdinalIgnoreCase) != 0)
            {
                sb.Insert(0, '/');
            }
            var qs = AddQueryString(config, hasQuestionMark: str.Contains("?"));
            if (qs.Length > 0)
            {
                sb.Append(qs);
            }
            
            if (!_siteContext.GeneralSettings.CdnCacheBustKey.IsNullOrEmpty())
            {
                sb.Append(qs.Length > 0 ? "&" : "?");
                sb.Append("_mzcb=").Append(_siteContext.GeneralSettings.CdnCacheBustKey);
            }

            if (sb.ToString()[0] == '/')
            {
                return sb.Insert(0, this._siteContext.CdnPrefix).ToString();
            }

            return sb.ToString();

        }

        private string MakeSortingUrl(object obj, Dictionary<string, object> config)
        {
            var searchContext = _pageContext.Search;
            if (obj is string)
            {
                return searchContext.ToUrl(new SearchContextOverrides() { SortBy = (string)obj });
            }
            object sortByObj;
            if (config != null && config.TryGetValue("sortBy", out sortByObj) && sortByObj is string)
            {
                return searchContext.ToUrl(new SearchContextOverrides() { SortBy = (string)sortByObj });
            }
            return "#";
        }

        private string MakeInStockLocationUrl(object obj, Dictionary<string, object> config)
        {
            var searchContext = _pageContext.Search;
            if (obj is string)
            {
                return searchContext.ToUrl(new SearchContextOverrides() { InStockLocation = (string)obj });
            }
            object inStockLocationObj;
            if (config != null && config.TryGetValue("inStockLocation", out inStockLocationObj) && inStockLocationObj is string)
            {
                return searchContext.ToUrl(new SearchContextOverrides() { InStockLocation = (string)inStockLocationObj });
            }
            return "#";
        }

        private string MakePagingUrl(object productCollection, Dictionary<string, object> config)
        {

            object obj;
            if (!config.TryGetValue("page", out obj))
            {
                throw new ArgumentException("missing page", "page");
            }

            string val = Convert.ToString(obj);
            int tmp;
            var searchContext = _pageContext.Search;


            int defaultPageSize = this._siteContext.ThemeSettings.Get<int>("defaultPageSize", 20);
            int pageSize = Resolver.ResolveMemberOrDefault<int>(productCollection, "PageSize", defaultPageSize);

            int currentStartIndex = Resolver.ResolveMemberOrDefault<int>(productCollection, "StartIndex", 0);

            var overrides = new SearchContextOverrides();
            if (config.TryGetValue("pageSize", out obj))
            {
                pageSize = Convert.ToInt32(obj);
                overrides.PageSize = pageSize;
            }

            if (string.Equals(val, "first", StringComparison.OrdinalIgnoreCase))
            {
                overrides.StartIndex = 0;
            }
            else if (string.Equals(val, "next", StringComparison.OrdinalIgnoreCase))
            {
                int currentPage = pageSize > 0 ? currentStartIndex / pageSize : 0;
                overrides.StartIndex = (currentPage + 1) * pageSize;
            }
            else if (string.Equals(val, "previous", StringComparison.OrdinalIgnoreCase))
            {
                int currentPage = pageSize > 0 ? currentStartIndex / pageSize : 0;
                if (currentPage > 0)
                {
                    overrides.StartIndex = (currentPage - 1) * pageSize;
                }
                else
                {
                    overrides.StartIndex = 0;
                }

            }
            else if (int.TryParse(val, out tmp) && tmp > 0)
            {
                overrides.StartIndex = (tmp - 1) * pageSize;
            }
            else if (obj is int)
            {
                overrides.StartIndex = (((int)obj) - 1) * pageSize;

            }

            return searchContext.ToUrl(overrides);


        }

        string MakeProductUrl(object obj, Dictionary<string, object> config, string hostName=null)
        {
            if (config != null && (config.ContainsKey("variant") || config.ContainsKey("vpc")) )
            {
                return MakeProductVariantUrl(obj, config, hostName);
            }
            Product product = obj as Product;
            string qs = string.Empty;
            if (config != null)
            {
                qs = AddQueryString(config, false);
            }
            if (product == null)
            {
                string productCode = null;
                string url = "#";
                if (obj is string)
                {
                    productCode = (string)obj;
                    url = $"/p/{productCode}";
                }
                if (productCode == null)
                {
                    url = Resolver.ResolveMemberOrDefault<string>(obj, "url", "#");
                }
                return $"{url}{qs}";
            }

            var canonicalUrl = _customRouteHandler.GetCanonicalUrl(FancyRoute.ProductDetails, 
                () => Mapper.Map<IDictionary<string, object>>(product), 
                false, hostName) ?? "/p/" + product.ProductCode;
            return canonicalUrl + qs;
        }

        private string MakeProductVariantUrl(object obj, Dictionary<string, object> config, string hostName=null)
        {
            Product product = obj as Product;
            string variantKey = config.ContainsKey("variant") ? "variant" : "vpc";
            string url = "#";
            string vpc = config[variantKey] as string;
            string qsVpc = $"?vpc={vpc}";
            string qs = AddQueryString(config.Where(x => !x.Key.EqualsIgnoreCase(variantKey))
                .ToDictionary(y => y.Key, z => z.Value), true);

            if (product != null)
            {
                url =
                    _customRouteHandler.GetCanonicalUrl(FancyRoute.ProductDetails,
                        () => Mapper.Map<IDictionary<string, object>>(product)
                                    .ChainSet("variant", vpc, true)
                                    .ChainSet("vpc", vpc, true),
                        false, hostName);
                if (!string.IsNullOrEmpty(url))
                {
                    return $"{url}{qsVpc}{qs}";
                }
                url = $"/p/{product.ProductCode}";
            }
            else
            {
                string productCode = null;
                if (obj is string)
                {
                    productCode = (string)obj;
                    url = $"/p/{productCode}";
                }
                if (string.IsNullOrEmpty(productCode))
                {
                    url = Resolver.ResolveMemberOrDefault<string>(obj, "url", "#");
                }
            }
            return $"{url}{qsVpc}{qs}";
        }

        string MakeCategoryUrl(object obj, Dictionary<string, object> config, bool includeContxt, bool forFaceting, string hostname=null)
        {
            int categoryId = -1;
            string categoryCode = null;
            if (obj is int)
            {
                categoryId = (int)obj;
            }
            else if (obj is string)
            {

                if (!int.TryParse((string)obj, out categoryId))
                {
                    categoryId = -1;
                    categoryCode = (string)obj;
                }

            }
            if (string.IsNullOrWhiteSpace(categoryCode) && categoryId == -1)
            {
                categoryId = Resolver.ResolveMemberOrDefault(obj, "categoryId", -1);
            }

            if (string.IsNullOrWhiteSpace(categoryCode) && categoryId == -1)
            {
                var facetValue = Resolver.ResolveMemberOrDefault<string>(obj, "filterValue");
                if (!string.IsNullOrEmpty(facetValue))
                {
                    includeContxt = true;
                    var parts = facetValue.Split(':');
                    if (parts.Length < 2 || !int.TryParse(parts[1], out categoryId))
                    {
                        categoryId = -1;
                    }

                }
            }

            if (string.IsNullOrWhiteSpace(categoryCode) && categoryId == -1)
            {
                return "#";
            }


            var tree = _categoryTreeProvider.Value.GetAllCategories();
            var cat = categoryId != -1 ? tree.FindById(categoryId) : tree.FindByCode(categoryCode);
            if (cat == null)
            {
                return "#";
            }


            if (forFaceting && _pageContext.PageType == "search")
            {
                return _pageContext.Search.ToUrl(new SearchContextOverrides()
                {
                    UrlBase = "/search",

                    CategoryId = cat.CategoryId
               });
            }


            // we know we're doing a category facet, so we can kill the pagination
            var url = _customRouteHandler.GetCanonicalUrl(FancyRoute.Category, () => Mapper.Map<IDictionary<string, object>>(cat).ChainSet(config), includeContxt, hostName: hostname);
            if (url == null)
            {
                url = "/c/" + cat.CategoryId;
                if (includeContxt)
                {
                    url += _context.GetRequestUri().Query;
                }

            }
            return url;
        }
        string MakeImageUrl(dynamic obj, Dictionary<string, object> config)
        {
            string url = null;
            if (obj is string)
            {
                url = obj as string;
                if (string.IsNullOrEmpty(url))
                {
                    return "#";
                }
            }
            if (url == null)
            {
                url = Resolver.ResolveMemberOrDefault<string>(obj, "imageUrl");
            }
            //todo cmsid stuff..

            if (string.IsNullOrEmpty(url))
            {
                return "#";
            }
            var sb = new StringBuilder(url);
            //cdnify
            if (url.Length > 2 && url[0] == '/' && url[1] != '/')
            {
                sb.Insert(0, _siteContext.CdnPrefix);
            }
            var qs = AddQueryString(config, hasQuestionMark: url.Contains("?"));
            if (qs.Length > 0)
            {
                sb.Append(qs).Append("&");
            }
            else
            {
                sb.Append("?");
            }

            sb.Append("_mzcb=").Append(_siteContext.GeneralSettings.CdnCacheBustKey);
            return sb.ToString();
        }

        string MakeFacetUrl(object obj, string hostname)
        {
            var routeData = _context.GetRouteData();

            // facets are primarily handled through the searchContext, and so to large extent we'll be returning 
            // searchContext.ToUrl(SearchContextOverrides) in order to properly encode the facets.
            var searchContext = _pageContext.Search;
            var strObj = obj as string;

            if (strObj == "clear")
            {

                return MakeCategoryUrlAndClearFacets( searchContext);
            }

            var facetValue = obj is string ? strObj : Resolver.ResolveMemberOrDefault<string>(obj, "filterValue");

            // this means we're dealing with category facet
            if (string.IsNullOrEmpty(facetValue))
            {

                return MakeCategoryUrlAndKeepFacets(() => GetCategoryIdFromCategoryFacet(obj), searchContext);
            }

            // this means we have some other facet type
            var isApplied = !(obj is string) && Resolver.ResolveMemberOrDefault(obj, "isApplied", false);
            var facetParts = facetValue.Split(':');
            if (facetParts.Length != 2)
            {
                return "#";
            }
            var facetPairKey = facetParts[0];
            var facetPairValue = facetParts[1];

            // if the facet to make the url for is just 'category', then the 'facet url' is just the canonical category url
            int catId;
            if (facetPairKey.Equals("categoryId", StringComparison.OrdinalIgnoreCase) && int.TryParse(facetPairValue, out catId))
            {
                var url = MakeCategoryUrl(catId, null, true, true);
                return searchContext.ToUrl(new SearchContextOverrides() { UrlBase = url , StartIndex = 0, CategoryId = catId });
            }

            return MakeUrlForAllOtherFacetTypes(routeData, searchContext, isApplied, facetPairKey, facetPairValue);
        }

        string MakeUrlForAllOtherFacetTypes(RouteData routeData, SearchContext searchContext, bool isApplied, string facetPairKey, string facetPairValue)
        {
            string facetUrl = null;
            var existing = searchContext.Facets.GetValues(facetPairKey);
            if (isApplied && existing != null)
            {
                var routeValueKey = facetPairKey + "-facet";
                if (routeData.Values.TryGetValue(routeValueKey, out var tmp) && string.Equals((tmp as string), facetPairValue, StringComparison.OrdinalIgnoreCase))
                {
                    var dic = new Dictionary<string, object>(routeData.Values, StringComparer.OrdinalIgnoreCase);
                    dic.Remove(routeValueKey);
                    facetUrl = _customRouteHandler.GetCanonicalUrl(routeData.Routers.OfType<CustomRoute>().First().InternalRoute, () => dic, false);
                }
            }

            var overrides = new SearchContextOverrides()
            {
                UrlBase = facetUrl,
                RemoveFacet = isApplied ? new KeyValuePair<string, string>(facetPairKey, facetPairValue) : default(KeyValuePair<string, string>),
                AddFacet = !isApplied ? new KeyValuePair<string, string>(facetPairKey, facetPairValue) : default(KeyValuePair<string, string>),
                StartIndex = 0
            };
            return searchContext.ToUrl(overrides);
        }

        string MakeCategoryUrlAndKeepFacets(Func<int?> categoryIdResolver, SearchContext searchContext)
        {
            var catId = categoryIdResolver();
            if (catId.HasValue) return searchContext.ToUrl(new SearchContextOverrides { UrlBase = MakeCategoryUrl(catId.Value, null, false,true ), StartIndex = 0 });
            else return "#";
        }

        int? GetCategoryIdFromCategoryFacet(object categoryFacet)
        {
            int catId;
            var childrenFacetValues = Resolver.ResolveMemberOrDefault<object>(categoryFacet, "childrenFacetValues");
            if (childrenFacetValues != null)
            {
                //must be a top level cat with no immediate child products
                var tempCat = Resolver.ResolveMemberOrDefault<string>(categoryFacet, "value");
                if (int.TryParse(tempCat, out catId))
                {
                    return catId;
                }
            }
            return null;
        }

        int? GetCategoryIdFromRouteData(RouteData routeData)
        {
            int catId;
            object tmpObj;
            if (routeData.Values.TryGetValue("categoryId", out tmpObj) && int.TryParse(tmpObj.ToString(), out catId))
            {
                return catId;
            }
            return null;
        }

        string MakeCategoryUrlAndClearFacets( SearchContext searchContext)
        {
            return searchContext.ToClearUrl(_customRouteHandler, searchContext, clearFacets:true);
        }

        static string ClearFacetsFromUrl(string url, SearchContext context)
        {
            return context.ToUrl(new SearchContextOverrides { ClearFacets = true, UrlBase = url, StartIndex = 0 });
        }

        static string AddQueryString(Dictionary<string, object> config, bool hasQuestionMark=false)
        {
            if (config.Count == 0) return string.Empty;
            var sb = new StringBuilder();
            sb.Append(hasQuestionMark ? '&' : '?');
            foreach (var kvp in config.Where(kvp => kvp.Value != null))
            {
                sb.Append(kvp.Key).Append("=").Append(HttpUtility.UrlEncode(kvp.Value.ToString())).Append("&");
            }
            return sb.ToString(0, sb.Length-1);
        }
    }
}
