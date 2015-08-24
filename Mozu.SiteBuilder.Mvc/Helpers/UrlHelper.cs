using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using AutoMapper;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using NDjango.Interfaces;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.Mvc.Helpers
{
    public class UrlHelper
    {
        private readonly ISiteContext _siteContext;
        private readonly IPageContext _pageContext;
        private readonly ICustomRouteHandler _customRouteHandler;
        private readonly HttpRequestMessage _httpRequestMessage;
        private readonly Lazy<ICategoryTreeProvider> _categoryTreeProvider;

        public UrlHelper(ISiteContext siteContext ,
            IPageContext pageContext, 
            ICustomRouteHandler customRouteHandler, 
            HttpRequestMessage httpRequestMessage,
            Lazy<ICategoryTreeProvider> categoryTreeProvider)
        {
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
            foreach ( var name in config.GetDynamicMemberNames())
            {
                object  configValue;
                if (config.TryGetMember(MyGetMemberBinder.Get(name),out configValue))
                {
                    dic[name] = configValue;
                }
            }
            return MakeUrl(type, obj, dic, false);
        }
        class MyGetMemberBinder : GetMemberBinder
        {
            public static System.Collections.Concurrent.ConcurrentDictionary<string, MyGetMemberBinder> _cache = new System.Collections.Concurrent.ConcurrentDictionary<string, MyGetMemberBinder>();

            public static MyGetMemberBinder Get( string key)
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
                        url = MakeFacetUrl( obj);
                        break;
                    }
                case "paging":
                    {
                        return MakePagingUrl(obj, config);
                    }
                case "sorting":
                    {
                        return MakeSortingUrl(obj);
                    }
                case "image":
                    {
                        url = MakeImagetUrl( obj, config);
                        break;
                    }
                case "category":
                    {
                        url = MakeCategoryUrl( obj, config, includeContxt);
                        break;
                    }
                case "product":
                    {
                        url = MakeProductUrl( obj);
                        break;
                    }
                case "cdn":
                    {
                        url = MakeCdnUrl(obj);
                        break;
                    }
                default:
                    {
                        throw new RenderingError(string.Format("unknown type [{0}]", type), null);
                    }
            }
            return url;
        }

        private string MakeCdnUrl(object o)
        {

            var str = o as string;
            if (string.IsNullOrEmpty(str))
            {
                return "#";
            }
            if (str[0] != '/' && str.IndexOf("http", StringComparison.OrdinalIgnoreCase) != 0)
            {
                str = '/' + str;
            }

            if ( str[0]=='/')
            {
                return this._siteContext.CdnPrefix + str;
            }
            return str;

        }

        private string MakeSortingUrl(object obj)
        {
            string val = obj as string;
            var searchContext = _pageContext.Search;
            
            return searchContext.ToUrl(new SearchContextOverrides() { SortBy = val });


        }

        private string MakePagingUrl(object productCollection, Dictionary<string, object> config)
        {
            
            object obj;
            if ( !config.TryGetValue("page", out obj))
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
            

            if ( string.Equals( val, "first", StringComparison.OrdinalIgnoreCase))
            {
                overrides.StartIndex =  0;
            }
            else if (string.Equals(val, "next", StringComparison.OrdinalIgnoreCase))
            {
                int currentPage = currentStartIndex / pageSize;
                overrides.StartIndex =  (currentPage + 1) * pageSize;
            }
            else if (string.Equals(val, "previous", StringComparison.OrdinalIgnoreCase))
            {
                int currentPage = currentStartIndex / pageSize;
                if ( currentPage > 0 )
                {
                    overrides.StartIndex = (currentPage - 1) * pageSize;
                }
                else
                {
                    overrides.StartIndex = 0;
                }
               
            }
            else if ( int.TryParse( val , out tmp )&& tmp > 0)
            {
                overrides.StartIndex = (tmp -1) * pageSize;
            }
            else if ( obj is int )
            {
                overrides.StartIndex = (((int)obj) - 1) * pageSize;

            }
            
            return searchContext.ToUrl(overrides);


        }

        public  string MakeProductUrl(object  obj)
        {

            Product product = obj as Product;
           
            if (product == null)
            {
                string productCode = null;
                string url = "#";
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


            
            return _customRouteHandler.GetCannonicalUrl(FancyRoute.ProductDetails, () => Mapper.Map<IDictionary<string, object>>(product), false).Result ?? "#";

        }
        public string MakeCategoryUrl( object obj, Dictionary<string, object> config, bool includeContxt)
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
         

            //maybe remove existing context?
            return _customRouteHandler.GetCannonicalUrl(FancyRoute.Category, () => Mapper.Map<IDictionary<string, object>>(cat).ChainSet(config), includeContxt).Result ?? "#";
        }




        public  string MakeImagetUrl( dynamic obj, Dictionary<string,object> config)
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
                sb.Insert(0,_siteContext.CdnPrefix);
              //  url = _siteContext.CdnPrefix + url;
            }
            if (url.IndexOf('?') == -1)
                {
                    sb.Append( "?");
                }
                else
                {
                 sb.Append( "&");
                   
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
            if (strObj == "CLEAR")
            {


                if ( routeData.Values.TryGetValue("categoryId", out tmpObj) && int.TryParse(tmpObj.ToString(), out catId))
                {
                    urlBase = MakeCategoryUrl(catId, null, false);
                }
                return searchContext.ToUrl(new SearchContextOverrides() { ClearFacets = true , UrlBase= urlBase });
                
            }


            
            var facetValue = obj is string ? (string)obj : _resolver.ResolveMemberOrDefault<string>(obj, "filterValue");
          
            if (string.IsNullOrEmpty(facetValue))
            {
                var childrenFacetValues = _resolver.ResolveMemberOrDefault<object>(obj, "childrenFacetValues");
                if( childrenFacetValues !=null)
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
            
            if (facetPairKey.Equals( "categoryId", StringComparison.OrdinalIgnoreCase)&& int.TryParse( facetPairValue, out catId))
            {
                return  MakeCategoryUrl(catId, null, true);
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
            return searchContext.ToUrl(overrides);


            
        }
    }
}
