using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Net.Http;
using System.Text;
using System.Web;
using AutoMapper;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using NDjango.Interfaces;
using Newtonsoft.Json.Linq;
using System.Web.Http.Routing;

namespace Mozu.SiteBuilder.Mvc.Helpers
{
    public class UrlHelper
    {
        private readonly ISiteBuilderApiContext _apiContext;
        private readonly ISiteContext _siteContext;
        private readonly IPageContext _pageContext;
        private readonly ICustomRouteHandler _customRouteHandler;
        private readonly HttpRequestMessage _httpRequestMessage;
        private readonly Lazy<ICategoryTreeProvider> _categoryTreeProvider;

        public UrlHelper(ISiteContext siteContext,
            ISiteBuilderApiContext apiContext,
            IPageContext pageContext,
            ICustomRouteHandler customRouteHandler,
            HttpRequestMessage httpRequestMessage,
            Lazy<ICategoryTreeProvider> categoryTreeProvider)
        {
            _apiContext = apiContext;
            _siteContext = siteContext;
            _pageContext = pageContext;
            _customRouteHandler = customRouteHandler;
            _httpRequestMessage = httpRequestMessage;
            _categoryTreeProvider = categoryTreeProvider;
        }

        static JsonCleaningCaseInsensitiveMemberResolver _resolver = new JsonCleaningCaseInsensitiveMemberResolver();

        [Microsoft.ClearScript.ScriptMember("getUrl")]
        public string MakeUrl(string type, object obj, DynamicObject config)
        {
            Dictionary<string, object> dic = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
            foreach (var name in config.GetDynamicMemberNames())
            {
                object configValue;
                if (config.TryGetMember(MyGetMemberBinder.Get(name), out configValue))
                {
                    dic[name] = configValue;
                }
            }
            return MakeUrl(type, obj, dic, false);
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
        public string MakeUrl(string type, object obj, Dictionary<string, object> config)
        {
            return MakeUrl(type, obj, config, false);
        }
        public string MakeUrl(string type, object obj, Dictionary<string, object> config, bool includeContxt)
        {

            var url = "#";

            switch (type)
            {
                case "facet":
                    {
                        url = MakeFacetUrl(obj);
                        break;
                    }
                case "paging":
                    {
                        return MakePagingUrl(obj, config);
                    }
                case "sorting":
                    {
                        return MakeSortingUrl(obj, config);
                    }
                case "image":
                    {
                        url = MakeImageUrl(obj, config);
                        break;
                    }
                case "category":
                    {
                        url = MakeCategoryUrl(obj, config, includeContxt);
                        break;
                    }
                case "product":
                    {
                        url = MakeProductUrl(obj);
                        break;
                    }
                case "stylesheet":
                    {
                        url = MakeStylesheetUrl(obj, config);
                        break;
                    }
                case "cdn":
                    {
                        url = MakeCdnUrl(obj, config);
                        break;
                    }
                case "document":
                    {
                        url = MakeDocumentUrl(obj, config);
                        break;
                    }
                case "search":
                    {
                        url = MakeSearchUrl();
                        break;
                    }
                case "cart":
                    {
                        url = MakeCartUrl();
                        break;
                    }
                default:
                    {
                        throw new RenderingError(string.Format("unknown type [{0}]", type), null);
                    }
            }
            return url;
        }

        private string MakeCartUrl()
        {
            return _customRouteHandler.GetCanonicalUrl(FancyRoute.Cart, null, false).Result ?? "/cart";
        }

        private string MakeSearchUrl()
        {
            return _customRouteHandler.GetCanonicalUrl(FancyRoute.Search, null, false).Result ?? "/search";
        }

        private string MakeStylesheetUrl(object obj, Dictionary<string, object> config)
        {
            var url = MakeCdnUrl(obj, config);
            var sb = new StringBuilder(url);

            // the url gets a '?' added to it from makecdn uy
            //sb.Append(url.IndexOf('?') == -1 ? '?' : '&');

            sb.Append("SBTHEME=").Append(HttpUtility.UrlEncode(this._siteContext.Theme.Id));

            // debug mode MUST be set or else the request to resources will fail
            sb.AppendFormat("&debug={0}", _pageContext.IsDebugMode);

            if (this._apiContext.DataViewMode == Core.DataViewModeType.Pending)
            {
                sb.Append("&dv=p");
            }

            foreach (var kvp in config)
            {
                if (kvp.Value == null)
                {
                    continue;
                }
                sb.Append('&').Append(kvp.Key).Append("=").Append(HttpUtility.UrlEncode(kvp.Value.ToString()));
            }

            return sb.ToString();

        }
        string MakeDocumentUrl(object o, Dictionary<string, object> config)
        {
            Mozu.Content.Contracts.Document doc = null;
            if (o is string)
            {
                doc = new Mozu.Content.Contracts.Document() { Name = (string)o };
                return DoMakeDocumentUrl(doc, config);

            }
            doc = o as Mozu.Content.Contracts.Document;
            if (doc != null)
            {
                return DoMakeDocumentUrl(doc, config);
            }

            var name = _resolver.ResolveMemberOrDefault<string>(o, "name", null);
            if (string.IsNullOrEmpty(name))
            {
                return "#";
            }
            doc = new Content.Contracts.Document()
            {
                Name = name,
                ListFQN = _resolver.ResolveMemberOrDefault<string>(o, "ListFQN", null),
                DocumentTypeFQN = _resolver.ResolveMemberOrDefault<string>(o, "DocumentTypeFQN", null),
                Properties = _resolver.ResolveMemberOrDefault<JObject>(0, "Properties")

            };
            return DoMakeDocumentUrl(doc, config);
        }

        string DoMakeDocumentUrl(Mozu.Content.Contracts.Document doc, Dictionary<string, object> config)
        {
            return _customRouteHandler.GetCanonicalUrl(FancyRoute.CmsPage, () => Mapper.Map<IDictionary<string, object>>(doc).ChainSet(config), false).Result ?? "/" + doc.Name;
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
                str = '/' + str;
                sb.Insert(0, str);
            }

            sb.Append(str.IndexOf('?') == -1 ? '?' : '&');

            foreach (var kvp in config)
            {
                if (kvp.Value == null)
                {
                    continue;
                }
                sb.Append(kvp.Key).Append("=").Append(HttpUtility.UrlEncode(kvp.Value.ToString())).Append("&");
            }

            if (!_siteContext.GeneralSettings.CdnCacheBustKey.IsNullOrEmpty())
            {
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


            int defaultPageSize = ((int?)(JToken)this._siteContext.ThemeSettings["defaultPageSize"]) ?? 20;
            int pageSize = _resolver.ResolveMemberOrDefault<int>(productCollection, "PageSize", defaultPageSize);

            int currentStartIndex = _resolver.ResolveMemberOrDefault<int>(productCollection, "StartIndex", 0);

            var overrides = new SearchContextOverrides();
            overrides.UrlBase = "/"+  new Uri(this._pageContext.Url).GetComponents(UriComponents.Path, UriFormat.Unescaped);
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

        public string MakeProductUrl(object obj)
        {

            Product product = obj as Product;
            string url;
            if (product == null)
            {
                string productCode = null;
                url = "#";
                if (obj is string)
                {
                    productCode = (string)obj;
                    url = "/p/" + productCode;
                }
                if (productCode == null)
                {
                    url = _resolver.ResolveMemberOrDefault<string>(obj, "url", "#");
                }
                return url;
            }



            return _customRouteHandler.GetCanonicalUrl(FancyRoute.ProductDetails, () => Mapper.Map<IDictionary<string, object>>(product), false).Result ?? "/p/" + product.ProductCode;

        }
        public string MakeCategoryUrl(object obj, Dictionary<string, object> config, bool includeContxt)
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
            if (categoryCode == null && categoryId == -1)
            {
                categoryId = _resolver.ResolveMemberOrDefault<int>(obj, "categoryId", -1);
            }

            if (categoryCode == null && categoryId == -1)
            {
                var facetValue = _resolver.ResolveMemberOrDefault<string>(obj, "filterValue");
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

            else if (categoryId == -1)
            {
                return "#";
            }


            var tree = _categoryTreeProvider.Value.GetAllCategories().Result;
            var cat = categoryId != -1 ? tree.FindById(categoryId) : tree.FindByCode(categoryCode);
            if (cat == null)
            {
                return "#";
            }


            if (_pageContext.PageType == "search")
            {
                return _pageContext.Search.ToUrl(new SearchContextOverrides()
                {
                    UrlBase = "/search",
                    CategoryId = cat.CategoryId
               });
            }

            // we know we're doing a category facet, so we can kill the pagination
            var url = _customRouteHandler.GetCanonicalUrl(FancyRoute.Category, () => Mapper.Map<IDictionary<string, object>>(cat).ChainSet(config), includeContxt).Result;
            if (url == null)
            {
                url = "/c/" + cat.CategoryId;
                if (includeContxt)
                {
                    url += this._httpRequestMessage.RequestUri.Query;
                }

            }
            return url;
        }
        public string MakeImageUrl(dynamic obj, Dictionary<string, object> config)
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
                url = _resolver.ResolveMemberOrDefault<string>(obj, "imageUrl");
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
                //  url = _siteContext.CdnPrefix + url;
            }
            if (url.IndexOf('?') == -1)
            {
                sb.Append("?");
            }
            else
            {
                sb.Append("&");

            }

            foreach (var kvp in config)
            {
                if (kvp.Value == null)
                {
                    continue;
                }
                sb.Append(kvp.Key).Append("=").Append(HttpUtility.UrlEncode(kvp.Value.ToString())).Append("&");
            }

            sb.Append("_mzcb=").Append(_siteContext.GeneralSettings.CdnCacheBustKey);
            return sb.ToString();
        }

        public string MakeFacetUrl(object obj)
        {
            var routeData = _httpRequestMessage.GetRouteData();

            // facets are primarily handled through the searchContext, and so to large extent we'll be returning 
            // searchContext.ToUrl(SearchContextOverrides) in order to properly encode the facets.
            var searchContext = _pageContext.Search;
            var strObj = obj as string;

            if (strObj == "clear")
            {
                return MakeCategoryUrlAndClearFacets(() => GetCategoryIdFromRouteData(routeData), searchContext);
            }

            var facetValue = obj is string ? strObj : _resolver.ResolveMemberOrDefault<string>(obj, "filterValue");

            // this means we're dealing with category facet
            if (string.IsNullOrEmpty(facetValue))
            {
                return MakeCategoryUrlAndKeepFacets(() => GetCategoryIdFromCategoryFacet(obj), searchContext);
            }

            // this means we have some other facet type
            var isApplied = !(obj is string) && _resolver.ResolveMemberOrDefault(obj, "isApplied", false);
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
                var url = MakeCategoryUrl(catId, null, false);
                return searchContext.ToUrl(new SearchContextOverrides() { UrlBase = url , StartIndex = 0});
            }

            return MakeUrlForAllOtherFacetTypes(routeData, searchContext, isApplied, facetPairKey, facetPairValue);
        }

        string MakeUrlForAllOtherFacetTypes(IHttpRouteData routeData, SearchContext searchContext, bool isApplied, string facetPairKey, string facetPairValue)
        {
            string facetUrl = null;
            var existing = searchContext.Facets.GetValues(facetPairKey);
            if (isApplied && existing != null)
            {
                var routeValueKey = facetPairKey + "-facet";
                object tmp;
                if (routeData.Values.TryGetValue(routeValueKey, out tmp) && string.Equals((tmp as string), facetPairValue, StringComparison.OrdinalIgnoreCase))
                {
                    var dic = new Dictionary<string, object>(routeData.Values, StringComparer.OrdinalIgnoreCase);
                    dic.Remove(routeValueKey);
                    facetUrl = _customRouteHandler.GetCanonicalUrl((routeData.Route as CustomRoute).InternalRoute, () => dic, false).Result;
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
            if (catId.HasValue) return searchContext.ToUrl(new SearchContextOverrides { UrlBase = MakeCategoryUrl(catId.Value, null, false), StartIndex = 0 });
            else return "#";
        }

        int? GetCategoryIdFromCategoryFacet(object categoryFacet)
        {
            int catId;
            var childrenFacetValues = _resolver.ResolveMemberOrDefault<object>(categoryFacet, "childrenFacetValues");
            if (childrenFacetValues != null)
            {
                //must be a top level cat with no immediate child products
                var tempCat = _resolver.ResolveMemberOrDefault<string>(categoryFacet, "value");
                if (int.TryParse(tempCat, out catId))
                {
                    return catId;
                }
            }
            return null;
        }

        int? GetCategoryIdFromRouteData(IHttpRouteData routeData)
        {
            int catId;
            object tmpObj;
            if (routeData.Values.TryGetValue("categoryId", out tmpObj) && int.TryParse(tmpObj.ToString(), out catId))
            {
                return catId;
            }
            return null;
        }

        string MakeCategoryUrlAndClearFacets(Func<int?> categoryIdResolver, SearchContext searchContext)
        {
            var categoryId = categoryIdResolver();
            if (categoryId.HasValue)
            {
                var catUrl = MakeCategoryUrl(categoryId.Value, null, false);
                return ClearFacetsFromUrl(catUrl, searchContext);
            }
            else
            {
                return ClearFacetsFromUrl(string.Empty, searchContext);
            }
        }

        static string ClearFacetsFromUrl(string url, SearchContext context)
        {
            return context.ToUrl(new SearchContextOverrides { ClearFacets = true, UrlBase = url, StartIndex = 0 });
        }
    }
}
