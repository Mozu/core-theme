using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Mozu.Core.Configuration;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using Microsoft.Extensions.Primitives;
using Mozu.Core;

namespace Mozu.SiteBuilder.Mvc.Contexts
{
    public class SearchContext : IProductListingState
    {
        private readonly HttpContext _context;
        private const string ROUTE_DATA_KEY = "facetValueFilter";
        private const string QUERY_STRING_KEY = "facetValueFilter";
        private const string ROUTE_DATA_VALUE_KEY_SUFFIX = "-facet";
        private static readonly Regex KvpRegex = new Regex(@"(?<key>[^,\:]+)(\:(?<val>[^,]*))?");
        private RouteData _initedData;

        private SearchContext()
        {
        }
        public SearchContext(HttpContext context)
        {
            _context = context;
            Facets = new NameValueCollection(StringComparer.OrdinalIgnoreCase);
            InitFromQstring(context);
            InitFromRouteData(context.GetRouteData());
        }
        public static SearchContext CreateForTest()
        {
            return new SearchContext();
        }
        public SearchContext Clone()
        {
            return new SearchContext() { Facets = new NameValueCollection(Facets) };
        }

        private void InitFromQstring(HttpContext context)
        {
            var qs = context.Request.Query;
            var routeData = context.GetRouteData();
            var facetValueQsValue = qs[QUERY_STRING_KEY];

            if (!string.IsNullOrWhiteSpace(facetValueQsValue))
            {
                var matchesw = KvpRegex.Matches(facetValueQsValue);
                foreach (Match m in matchesw)
                {
                    Facets.Add(m.Groups["key"].Value, m.Groups["val"].Value);
                }
            }

            if (!routeData.Values.ContainsKey("pageSize") && int.TryParse( qs["pageSize"], out var tmpInt))
            {
                routeData.Values["pageSize"] = tmpInt;
            }
            if (!routeData.Values.ContainsKey("startIndex") && int.TryParse(qs["startIndex"], out tmpInt))
            {
                routeData.Values["startIndex"] = tmpInt;
            }
            if (!routeData.Values.ContainsKey("sortBy") && !string.IsNullOrEmpty(qs["sortBy"]))
            {
                routeData.Values["sortBy"] = qs["sortBy"];
            }
            if (!routeData.Values.ContainsKey("inStockLocation") && !string.IsNullOrEmpty(qs["inStockLocation"]))
            {
                routeData.Values["inStockLocation"] = qs["inStockLocation"];
            }
            if (!routeData.Values.ContainsKey("query") && !string.IsNullOrEmpty(qs["query"]))
            {
                routeData.Values["query"] = qs["query"]; 
            }
            if (!routeData.Values.ContainsKey("categoryId") && !string.IsNullOrEmpty(qs["categoryId"]))
            {
                routeData.Values["categoryId"] = qs["categoryId"];
            }
        }

        private void InitFromRouteData(RouteData httpRouteData)
        {
            if (_initedData == httpRouteData)
            {
                return;
            }
            _initedData = httpRouteData;

            foreach (var key in httpRouteData.Values.Keys.Where(x => x.EndsWith(ROUTE_DATA_VALUE_KEY_SUFFIX, StringComparison.OrdinalIgnoreCase)))
            {
                var facetValueKey = key.Substring(0, key.Length - ROUTE_DATA_VALUE_KEY_SUFFIX.Length);
                var existingValues = this.Facets.GetValues(facetValueKey) ?? new string[0];

                var valObj = httpRouteData.Values[key];

                if (valObj is string val &&
                    !existingValues.Any(x => string.Equals(x, val, StringComparison.OrdinalIgnoreCase)))
                {
                    Facets.Add(facetValueKey, val);
                }
                else
                {
                    if (!(valObj is IEnumerable obj))
                    {
                        continue;
                    }

                    foreach (var subVal in obj.OfType<string>().Where(y => !existingValues.Any(x => string.Equals(x, y, StringComparison.OrdinalIgnoreCase))))
                    {
                        Facets.Add(facetValueKey, subVal);
                    }
                }
            }


            if (httpRouteData.Values.TryGetInt ("pageSize", out var tempInt))
            {
                httpRouteData.Values["pageSize"] = PageSize = tempInt;
            }
            if (httpRouteData.Values.TryGetInt("startIndex", out tempInt))
            {
                httpRouteData.Values["startIndex"] = StartIndex = tempInt;
            }
            if (httpRouteData.Values.TryGetInt("categoryId", out tempInt))
            {
                httpRouteData.Values["categoryId"] = CategoryId = tempInt;
            }
            if (httpRouteData.Values.TryGetValue("sortBy", out var temp) && IsNonEmptyString(temp))
            {
                SortBy = temp.ToString();
            }
            if (httpRouteData.Values.TryGetValue("inStockLocation", out temp) && IsNonEmptyString(temp))
            {
                InStockLocation = temp.ToString();
            }
            if (httpRouteData.Values.TryGetValue("query", out temp) && IsNonEmptyString(temp))
            {
                Query = temp.ToString();
            }
        }

        static bool IsNonEmptyString(object o)
        {
            if (o == null)
            {
                return false;
            }
            if (o is string)
            {
                return !string.IsNullOrEmpty((string) o);
            }

            if (o is StringValues)
            {
                return !StringValues.IsNullOrEmpty((StringValues) o);
            }

            return false;
        }
        internal void InitRouteData(IDictionary<string, object> httpRouteData)
        {
            httpRouteData[ROUTE_DATA_KEY] = this;
            foreach (string key in Facets.Keys)
            {
                var vals = Facets.GetValues(key);
                httpRouteData[key + ROUTE_DATA_VALUE_KEY_SUFFIX] = (vals != null && vals.Length > 1) ? vals : (object)Facets[key];
            }
        }

        public string ToFacetValueFilter()
        {
            return ToFacetValueFilterString(Facets);
        }
        
        public static string ToFacetValueFilterString(NameValueCollection facets)
        {

            if (facets.Count == 0)
            {
                return null;
            }
            var sb = new StringBuilder();
            foreach (string key in facets.Keys)
            {
                foreach (var val in facets.GetValues(key))
                {
                    if (sb.Length > 0)
                    {
                        sb.Append(",");
                    }
                    sb.Append(key);
                    sb.Append(':');
                    sb.Append(val);
                }

            }
            return sb.ToString();
        }
        public static string GetStringFromRequest(HttpRequest requestMessage)
        {
            return Get(requestMessage).ToFacetValueFilter();
        }
        public static SearchContext Get(HttpRequest requestMessage)
        {
            SearchContext col;
            var rd = requestMessage.HttpContext.GetRouteData().Values;
            if (rd.TryGetValue(ROUTE_DATA_KEY, out var tmp))
            {
                col = (SearchContext)tmp;
            }
            else
            {
                col = new SearchContext(requestMessage.HttpContext);
            }
            col.InitFromRouteData(requestMessage.HttpContext.GetRouteData());
            return col;
        }

        public int? StartIndex { get; set; }
        public string SortBy { get; set; }
        public int? PageSize { get; set; }
        public int? CategoryId { get; set; }
        public string Query { get; set; }
        public string InStockLocation { get; set; }

        [JsonConverter(typeof(FacetJsonConverter))]
        public NameValueCollection Facets { get; set; }

        public string ToClearUrl(ICustomRouteHandler routeHandler, SearchContext searchContext, bool clearFacets = false)
        {
            var routeData = _context.GetRouteData();
            var catId = searchContext.CategoryId ?? -1;

            if (routeData.Values.TryGetValue("categoryId", out var tmp))
            {
                int.TryParse((tmp ?? new object()).ToString(), out catId);
            }

            var isSearchRoute = routeData.Values.TryGetValue("controller", out tmp) && string.Equals(tmp as string, "search", StringComparison.OrdinalIgnoreCase);
            var routeType = isSearchRoute ? FancyRoute.Search : FancyRoute.Category;

            IDictionary<string, object> DicFn()
            {
                var routeValues = new Dictionary<string, object>(routeData.Values, StringComparer.OrdinalIgnoreCase);
                foreach (var key in routeData.Values.Keys.Where(x => x.EndsWith(ROUTE_DATA_VALUE_KEY_SUFFIX, StringComparison.OrdinalIgnoreCase)))
                {
                    routeValues.Remove(key);
                }

                return routeValues;
            }

            var baseUrl = routeHandler.GetCanonicalUrl(routeType, DicFn, false);
            if (baseUrl == null)
            {
                string categorySlug = null;
                if (routeData.Values.TryGetValue("categorySlug", out tmp))
                {
                    categorySlug = tmp as string;
                }
                
                if (isSearchRoute)
                {
                    baseUrl = "/search";
                }
                else
                {
                    if ( string .IsNullOrEmpty(categorySlug))
                    {
                        baseUrl = "/c/" + catId;
                    }
                    else
                    {
                        baseUrl ="/"+  categorySlug + "/c/" + CategoryId;
                    }
                }
            }
            if(isSearchRoute || clearFacets)
            {
                return ToUrl(new SearchContextOverrides()
                {
                    UrlBase = baseUrl,
                    ClearFacets = true,
                    //CategoryId = catId > 0 ? catId : (int?)null
                });
            }
            
            return baseUrl;
        }

        public string ToUrl(SearchContextOverrides overrides= null)
        {
            var clearFacets = overrides != null && overrides.ClearFacets;
            string facetQsVal = null;
            var urlBase = overrides?.UrlBase;
            var sortBy = overrides != null && overrides.SortByOverwritten  ? overrides.SortBy : SortBy;
            var inStockLocation = overrides != null && overrides.InStockLocationOverwritten ? overrides.InStockLocation : InStockLocation;
            var pageSize = overrides?.PageSize ?? PageSize;
            var startIndex = overrides?.StartIndex ?? StartIndex;
            var query = overrides != null && overrides.QueryOverwritten ? overrides.Query : Query;
            var categoryId = overrides?.CategoryId ?? CategoryId;
            #region doFacets
            if (!clearFacets && ( 
                (   
                Facets != null && 
                Facets.Count > 0 
                )
                || 
                (
                overrides?.AddFacet != null )
                )
                )
            {
                var (s, value) = overrides?.RemoveFacet ?? new KeyValuePair<string, string>();
                var addFacet = overrides?.AddFacet;


                var sb = new StringBuilder();
                if (Facets != null)
                    foreach (string key in Facets.Keys)
                    {
                        foreach (var val in Facets.GetValues(key))
                        {
                            if (string.Equals(key, s, StringComparison.OrdinalIgnoreCase) &&
                                string.Equals(val, value, StringComparison.OrdinalIgnoreCase))
                            {
                                continue;
                            }

                            if (sb.Length > 0)
                            {
                                sb.Append(",");
                            }

                            sb.Append(key);
                            sb.Append(':');
                            sb.Append(val);
                        }
                    }

                if (addFacet.HasValue)
                {
                    if (sb.Length > 0)
                    {
                        sb.Append(",");
                    }
                    sb.Append(addFacet.Value.Key);
                    sb.Append(':');
                    sb.Append(addFacet.Value.Value);
                }

                facetQsVal = sb.ToString();

            }
            #endregion doFacets

            var queryCollection = HttpUtility.ParseQueryString("");

            if (pageSize != null && pageSize.Value > 0)
            {
                queryCollection.Add("pageSize", pageSize.ToString());
            }

            if (!string.IsNullOrEmpty(sortBy))
            {
                queryCollection.Add("sortBy", sortBy);
            }

            if (!string.IsNullOrEmpty(inStockLocation))
            {
                queryCollection.Add("inStockLocation", inStockLocation);
            }

            if (!string.IsNullOrEmpty(facetQsVal))
            {
                queryCollection.Add("facetValueFilter", facetQsVal);
            }

            if (startIndex != null && startIndex.Value != 0)
            {
                queryCollection.Add("startIndex", startIndex.ToString());
            }
            

            if (!string.IsNullOrEmpty(query))
            {
                queryCollection.Add("query", query);
            }
            if (categoryId.HasValue)
            {
                queryCollection.Add("categoryId", categoryId.Value.ToString());
            }
            if (urlBase != null && urlBase.IndexOf('?') > 0)
            {
                urlBase = urlBase.Substring(0, urlBase.IndexOf('?'));
            }


            return queryCollection.Count > 0 ? urlBase + "?" + queryCollection :
                (string.IsNullOrWhiteSpace(urlBase) ? "?" : urlBase);
        }

        public T Resolve<T>()
        {
            return _context.RequestServices.Resolve<T>();
        }
    }

   

    public class SearchContextOverrides : IProductListingState
    {
       
        public SearchContextOverrides(Dictionary<string, object> config)
        {
            if (config.TryGetInt("startIndex", out var startIndex))
            {
                StartIndex = startIndex;
            }

            if (config.TryGetValue("sortBy", out var sortBy))
            {
                SortBy = Convert.ToString(sortBy);
            }

            if (config.TryGetValue("inStockLocation", out var inStockLocation))
            {
                InStockLocation = Convert.ToString(inStockLocation);
            }

            if (config.TryGetValue("query", out var query))
            {
                Query = Convert.ToString(query);
            }

            if (config.TryGetInt("pageSize", out var pageSize))
            {
                PageSize = pageSize;
            }
        }

        public SearchContextOverrides() { }

        private string _sortBy;

        private string _inStockLocation;

        private string _query;
      
        public int? StartIndex
        {
            get;set;
        }
        public string UrlBase { get; set; }

        public int? CategoryId { get; set; }
        public string SortBy
        {
            get => _sortBy;
            set
            {
                SortByOverwritten = true;
                _sortBy = value;
            }

        }

        public string InStockLocation
        {
            get => _inStockLocation;
            set
            {
                InStockLocationOverwritten = true;
                _inStockLocation = value;
            }

        }

        public bool SortByOverwritten
        {
            get; set;
        }

        public bool InStockLocationOverwritten
        {
            get; set;
        }

        public string Query
        {
            get => _query;
            set
            {
                QueryOverwritten = true;
                _query = value;
            }
        }

        public bool QueryOverwritten
        {
            get; set;
        }
        public int? PageSize
        {
            get; set;
        }

    
      

        public bool ClearFacets { get; set; }

        public KeyValuePair<string, string>? RemoveFacet { get; set; }
        public KeyValuePair<string,string>? AddFacet { get; set; }

        public T Resolve<T>()
        {
            return default;
        }
    }

    public class FacetJsonConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            return true;
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            NameValueCollection col = value as NameValueCollection;
            var filterString = SearchContext.ToFacetValueFilterString(col);
            writer.WriteValue(filterString);
        }
    }

}
