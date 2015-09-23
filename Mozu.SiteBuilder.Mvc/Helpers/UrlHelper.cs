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
            return _customRouteHandler.GetCannonicalUrl(FancyRoute.Cart, null, false).Result ?? "/cart";
        }

        private string MakeSearchUrl()
            {
                return _customRouteHandler.GetCannonicalUrl(FancyRoute.Search, null, false).Result ?? "/search";
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
            return _customRouteHandler.GetCannonicalUrl(FancyRoute.CmsPage, () => Mapper.Map<IDictionary<string, object>>(doc).ChainSet(config), false).Result ?? "/" + doc.Name;
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
            if (config != null && config.TryGetValue("sortBy", out sortByObj) && !string.IsNullOrWhiteSpace(sortByObj as string))
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
                int currentPage = currentStartIndex / pageSize;
                overrides.StartIndex = (currentPage + 1) * pageSize;
            }
            else if (string.Equals(val, "previous", StringComparison.OrdinalIgnoreCase))
            {
                int currentPage = currentStartIndex / pageSize;
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



            return _customRouteHandler.GetCannonicalUrl(FancyRoute.ProductDetails, () => Mapper.Map<IDictionary<string, object>>(product), false).Result ?? "/p/" + product.ProductCode;

        }
        public string MakeCategoryUrl(object obj, Dictionary<string, object> config, bool includeContxt)
        {
           
            // bool includeContxt = false;
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
                    CategoryId =cat.CategoryId

               });
            }


            var url = _customRouteHandler.GetCannonicalUrl(FancyRoute.Search, () => Mapper.Map<IDictionary<string, object>>(cat).ChainSet(config), includeContxt).Result;
            if (url == null)
            {
                url = "/c/" + cat.CategoryId;
                if (includeContxt)
                {
                    url += "?" + this._httpRequestMessage.RequestUri.Query;
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
            var searchContext = _pageContext.Search;
            var strObj = obj as string;
            string urlBase = null;
            object tmpObj;
            int catId;
            if (strObj == "clear")
            {


                if (routeData.Values.TryGetValue("categoryId", out tmpObj) && int.TryParse(tmpObj.ToString(), out catId))
                {
                    urlBase = MakeCategoryUrl(catId, null, false);
                }
                return searchContext.ToUrl(new SearchContextOverrides() { ClearFacets = true, UrlBase = urlBase, StartIndex = 0 });

            }



            var facetValue = obj is string ? (string)obj : _resolver.ResolveMemberOrDefault<string>(obj, "filterValue");

            if (string.IsNullOrEmpty(facetValue))
            {
                var childrenFacetValues = _resolver.ResolveMemberOrDefault<object>(obj, "childrenFacetValues");
                if (childrenFacetValues != null)
                {
                    //must be a top level cat with no immediate child products
                    var tempCat = _resolver.ResolveMemberOrDefault<string>(obj, "value");
                    if (int.TryParse(tempCat, out catId))
                    {
                        return MakeCategoryUrl(catId, null, true);
                    }

                }
                return "#";
            }


            var isApplied = !(obj is string) && _resolver.ResolveMemberOrDefault<bool>(obj, "isApplied", false);

            var facetParts = facetValue.Split(':');
            if (facetParts.Length != 2)
            {
                return "#";
            }


            var facetPairKey = facetParts[0];
            var facetPairValue = facetParts[1];

            if (facetPairKey.Equals("categoryId", StringComparison.OrdinalIgnoreCase) && int.TryParse(facetPairValue, out catId))
            {
                return MakeCategoryUrl(catId, null, true);
            }


            //handle stupid facets being in the stupid stem...
            var existing = searchContext.Facets.GetValues(facetPairKey);
            if (isApplied && existing != null)
            {
                var routeValueKey = facetPairKey + "-facet";
                object tmp;
                if (routeData.Values.TryGetValue(routeValueKey, out tmp) && string.Equals((tmp as string), facetPairValue, StringComparison.OrdinalIgnoreCase))
                {
                    var dic = new Dictionary<string, object>(routeData.Values, StringComparer.OrdinalIgnoreCase);
                    dic.Remove(routeValueKey);

                    urlBase = _customRouteHandler.GetCannonicalUrl((routeData.Route as CustomRoute).InternalRoute, () => dic, false).Result;

                }
            }



            var overrides = new SearchContextOverrides()
            {
                UrlBase = urlBase
            };
            if (isApplied)
            {
                overrides.RemoveFacet = new KeyValuePair<string, string>(facetPairKey, facetPairValue);
            }
            else
            {
                overrides.AddFacet = new KeyValuePair<string, string>(facetPairKey, facetPairValue);
            }
            overrides.StartIndex = 0;
            return searchContext.ToUrl(overrides);



        }
    }
}
