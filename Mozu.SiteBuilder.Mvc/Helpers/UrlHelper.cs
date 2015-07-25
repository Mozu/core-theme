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

namespace Mozu.SiteBuilder.Mvc.Helpers
{
    public class UrlHelper
    {
        private readonly SiteContext _siteContext;
        private readonly PageContext _pageContext;
        private readonly ICustomRouteHandler _customRouteHandler;
        private readonly HttpRequestMessage _httpRequestMessage;
        private readonly Lazy<ICategoryTreeProvider> _categoryTreeProvider;

        public UrlHelper(SiteContext siteContext ,
            PageContext pageContext, 
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
                default:
                    {
                        throw new RenderingError(string.Format("unknonw type [{0}]", type), null);
                    }
            }
            return url;
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
                url = _resolver.ResolveMemberOrDefault<string>(obj, "imageUrl")();
            }
            //todo cmsid stuff..

            if (string.IsNullOrEmpty(url))
            {
                return "#";
            }

            //cdnify
            if (url.Length > 2 && url[0] == '/' && url[0] != '/')
            {
                url = _siteContext.CdnPrefix + url;
            }

            foreach (var kvp in config)
            {
                if (kvp.Value == null)
                {
                    continue;
                }
                if (url.IndexOf('?') == -1)
                {
                    url += "?";
                }
                else
                {
                    url += "&";
                }

                url += kvp.Key + "=" + HttpUtility.UrlEncode(kvp.Value.ToString());
            }
            return url;
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
                return string.Format("{0}?&sortBy={1}", urlBase,  HttpUtility.UrlEncode(searchContext.SortBy));
                

            }


            var isApplied = !(obj is string) && _resolver.ResolveMemberOrDefault<bool>(obj, "isApplied", false);
            var facetValue = obj is string ? (string)obj : _resolver.ResolveMemberOrDefault<string>(obj, "filterValue");
          
            if (string.IsNullOrEmpty(facetValue))
            {
                var childrenFacetValues = _resolver.ResolveMemberOrDefault<string>(obj, "childrenFacetValues");
                if( childrenFacetValues !=null)
                {
                    //must be a top level cat with no immediate child products
                    catId = _resolver.ResolveMemberOrDefault<int>(obj, "value", -1);
                    if (catId > -1)
                    {
                        return MakeCategoryUrl(catId, null, true);
                    }

                }
                return "#";
            }
           
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

            
            var existing = searchContext.Facets.GetValues(facetPairKey);
            if (isApplied && existing != null)
            {
                searchContext.Facets.Remove(facetPairKey);
                foreach (var val in existing)
                {
                    if (val != facetPairValue)
                    {
                        searchContext.Facets.Add(facetPairKey, val);
                    }
                }
                
                var routeValueKey = facetPairKey + "-facet";
                object tmp;
                if (routeData.Values.TryGetValue(routeValueKey, out tmp) && string.Equals((tmp as string) , facetPairValue, StringComparison.OrdinalIgnoreCase))
                {
                    var dic = new Dictionary<string, object>(routeData.Values, StringComparer.OrdinalIgnoreCase);
                    dic.Remove(routeValueKey);

                    urlBase = _customRouteHandler.GetCannonicalUrl((routeData.Route as CustomRoute).InternalRoute, () => dic, false).Result;
                    
                }
            }
            else
            {
                searchContext.Facets.Add(facetPairKey, facetPairValue);
            }
            
            

            var url = string.Format("{0}?facetValueFilter={1}&sortBy={2}", urlBase, HttpUtility.UrlEncode(searchContext.ToFacetValueFilter()), HttpUtility.UrlEncode(searchContext.SortBy));

            

            searchContext.Facets.Remove(facetPairKey);
            if (  existing != null)
            {
                foreach (var val in existing)
                {
                    searchContext.Facets.Add(facetPairKey, val);
                }

            }
            return url;
        }
    }
}
