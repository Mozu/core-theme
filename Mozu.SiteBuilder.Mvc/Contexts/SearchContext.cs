using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Http.Routing;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.Mvc.Contexts
{
    public class SearchContext
    {
        const string RouteDataKey = "facetValueFilter";
        const string QueryStringKey = "facetValueFilter";
        const string RouteDataValueKeySuffix = "-facet";
        static readonly Regex KvpRegex = new Regex(@"(?<key>[^,\:]+)(\:(?<val>[^,]*))?");
        IHttpRouteData _initedData;

        private SearchContext()
        {
        }
        public SearchContext(HttpRequestMessage request)
        {
            Facets = new NameValueCollection(StringComparer.OrdinalIgnoreCase);
            InitFromQstring(request);
            InitFromRouteData(request.GetRouteData());
        }
        public SearchContext Clone()
        {
            return new SearchContext() { Facets = new NameValueCollection(Facets) };
        }
       
        void InitFromQstring(HttpRequestMessage request)
        {
            var qs = request.RequestUri.ParseQueryString();
            var routeData = request.GetRouteData();
            var facetValueQsValue = qs[QueryStringKey];
            if (!string.IsNullOrWhiteSpace(facetValueQsValue))
            {
                var matchesw = KvpRegex.Matches(facetValueQsValue);
                foreach (Match m in matchesw)
                {
                    this.Facets.Add(m.Groups["key"].Value, m.Groups["val"].Value);
                }
            }
            int tmpInt;
            if ( !routeData.Values.ContainsKey("pageSize") && int.TryParse( qs["pageSize"], out tmpInt))
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
            if (!routeData.Values.ContainsKey("query") && !string.IsNullOrEmpty(qs["query"]))
            {
                routeData.Values["query"] = qs["query"]; 
            }
            return;
        }
       
        void InitFromRouteData(IHttpRouteData httpRouteData)
        {
            if (_initedData == httpRouteData)
            {
                return;
            }
            _initedData = httpRouteData;

            foreach (var key in httpRouteData.Values.Keys.Where(x => x.EndsWith(RouteDataValueKeySuffix, StringComparison.OrdinalIgnoreCase)))
            {
                string facetValueKey = key.Substring(0, key.Length - RouteDataValueKeySuffix.Length);
                var existingValues = this.Facets.GetValues(facetValueKey) ?? new string[0];


                var valObj = httpRouteData.Values[key];

                var val = valObj as string;
                if (val != null &&
                    !existingValues.Any(x => string.Equals(x, val, StringComparison.OrdinalIgnoreCase)))
                {
                    this.Facets.Add(facetValueKey, val);
                }
                else
                {
                    var obj = valObj as IEnumerable;
                    if (obj == null)
                    {
                        continue;
                    }
                    foreach (var subVal in obj.OfType<string>().Where(y => !existingValues.Any(x => string.Equals(x, y, StringComparison.OrdinalIgnoreCase))))
                    {
                        this.Facets.Add(facetValueKey, subVal);
                    }
                }
            }


            object temp;
            if (httpRouteData.Values.TryGetValue("pageSize", out temp) && (!string.IsNullOrWhiteSpace(temp as string) || temp is int))
            {
                this.PageSize = Convert.ToInt32(temp);
            }
            if (httpRouteData.Values.TryGetValue("startIndex", out temp) && (!string.IsNullOrWhiteSpace(temp as string) || temp is int))
            {
                this.StartIndex = Convert.ToInt32(temp);
            }
            if (httpRouteData.Values.TryGetValue("categoryId", out temp) && (!string.IsNullOrWhiteSpace(temp as string) || temp is int))
            {
                this.CategoryId = Convert.ToInt32(temp);
            }
            if (httpRouteData.Values.TryGetValue("sortBy", out temp) && !string.IsNullOrWhiteSpace(temp as string))
            {
                this.SortBy = (string)temp;
            }
            if (httpRouteData.Values.TryGetValue("query", out temp) && !string.IsNullOrWhiteSpace(temp as string))
            {
                this.Query = (string)temp;
            }

        }
        internal void InitRouteData(IDictionary<string, object> httpRouteData)
        {
            httpRouteData[RouteDataKey] = this;
            foreach (string key in this.Facets.Keys)
            {
                var vals = this.Facets.GetValues(key);
                httpRouteData[key + RouteDataValueKeySuffix] = (vals != null && vals.Length > 1) ? (object)vals : (object)this.Facets[key];
            }
        }

        public string ToFacetValueFilter()
        {
            return ToFacetValueFilterString(this.Facets);
        }
        
        public static string ToFacetValueFilterString(NameValueCollection facets)
        {

            if (facets.Count == 0)
            {
                return null;
            }
            StringBuilder sb = new StringBuilder();
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
        public static string GetStringFromRequest(HttpRequestMessage requestMessage)
        {
            return Get(requestMessage).ToFacetValueFilter();
        }
        public static SearchContext Get(HttpRequestMessage requestMessage)
        {
            SearchContext col = null;
            object tmp;
            var rd = requestMessage.GetRouteData().Values;
            if (rd.TryGetValue(RouteDataKey, out tmp))
            {
                col = (SearchContext)tmp;
            }
            else
            {
                col = new SearchContext(requestMessage);
            }
            col.InitFromRouteData(requestMessage.GetRouteData());
            return col;
        }

        public int? StartIndex { get; set; }
        public string SortBy { get; set; }
        public int? PageSize { get; set; }

        public int? CategoryId { get; set; }
        public string Query { get; set; }

        [JsonConverter(typeof(FacetJsonConverter))]
        public NameValueCollection Facets { get; set; }

        public string ToUrl(SearchContextOverrides overrides= null)
        {
            var clearFacets = overrides != null && overrides.ClearFacets;
            string facetQsVal = null;
            string urlBase = overrides != null ? overrides.UrlBase : null;
            string sortBy = overrides != null && overrides.SortByOverwritten  ? overrides.SortBy : this.SortBy;
            var pageSize = overrides != null && overrides.PageSize.HasValue ? overrides.PageSize : this.PageSize;
            var startIndex = overrides != null && overrides.StartIndex.HasValue ? overrides.StartIndex : this.StartIndex;
            var query = overrides != null && overrides.QueryOverwritten ? overrides.Query : this.Query;
            #region doFacets
            if ( !clearFacets && ( 
                (   
                this.Facets != null && 
                this.Facets.Count> 0 
                )
                || 
                (
                overrides != null && 
                 overrides.AddFacet.HasValue )
                )
                )
            {
                var removeFacet = overrides != null && overrides.RemoveFacet.HasValue ? overrides.RemoveFacet.Value : new KeyValuePair<string, string>();
                var addFacet = overrides != null && overrides.AddFacet.HasValue ? overrides.AddFacet : null;


                StringBuilder sb = new StringBuilder();
                foreach (string key in Facets.Keys)
                {
                    foreach (var val in Facets.GetValues(key))
                    {
                        if ( string.Equals( key, removeFacet.Key, StringComparison.OrdinalIgnoreCase) &&
                            string.Equals(val, removeFacet.Value, StringComparison.OrdinalIgnoreCase) )
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



            var queryCollection = System.Web.HttpUtility.ParseQueryString("");

            if (pageSize != null)
            {
                queryCollection.Add("pageSize", pageSize.ToString());
            }

            if (!String.IsNullOrEmpty(sortBy))
            {
                queryCollection.Add("sortBy", sortBy);
            }

            if (!String.IsNullOrEmpty(facetQsVal))
            {
                queryCollection.Add("facetValueFilter", facetQsVal);
            }

            if (startIndex != null)
            {
                queryCollection.Add("startIndex", startIndex.ToString());
            }

            if (!String.IsNullOrEmpty(query))
            {
                queryCollection.Add("query", query);
            }

            return queryCollection.Count > 0 ? urlBase + "?" + queryCollection.ToString() : urlBase;

        }
    }
    public class SearchContextOverrides
    {
       
        public SearchContextOverrides(Dictionary<string, object> config)
        {
            object startIndex;
            if (config.TryGetValue("startIndex", out startIndex))
            {
                this.StartIndex = Convert.ToInt32(startIndex);
            }

            object sortBy;
            if (config.TryGetValue("sortBy", out sortBy))
            {
                this.SortBy = Convert.ToString(sortBy);
            }

            object query;
            if (config.TryGetValue("query", out query))
            {
                this.Query = Convert.ToString(query);
            }

            object pageSize;
            if (config.TryGetValue("pageSize", out pageSize))
            {
                this.PageSize = Convert.ToInt32(pageSize);
            }
        }

        public SearchContextOverrides() { }

        private string _sortBy;
        
        private string _query;
      
        public int? StartIndex
        {
            get;set;
        }
        public string UrlBase { get; set; }
        public string SortBy
        {
            get { return _sortBy; }
            set
            {
                SortByOverwritten = true;
                _sortBy = value;
            }

        }
        public bool SortByOverwritten
        {
            get; set;
        }
        public string Query
        {
            get { return _query; }
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
