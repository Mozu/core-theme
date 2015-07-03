using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.MessageHandler
{
    public class FacetValueFilterCollection : NameValueCollection
    {
     
        public FacetValueFilterCollection()
        {
          
        }
        public FacetValueFilterCollection(HttpRequestMessage request)
        {
            var qs = request.RequestUri.ParseQueryString()[FacetValueFilterCollection.QueryStringKey];

            InitFromQstring(qs);
            InitFromRouteData(request.GetRouteData());
        }

       

       
        private void InitFromQstring(string facetValueQsValue)
        {
          
            if (string.IsNullOrWhiteSpace(facetValueQsValue))
            {
                return;
            }
            var matchesw = _kvpRegex.Matches(facetValueQsValue);

            foreach (Match m in matchesw)
            {
                this.Add(m.Groups["key"].Value, m.Groups["val"].Value);
            }
            return;
        }
        private void InitFromRouteData(System.Web.Http.Routing.IHttpRouteData httpRouteData)
        {
            foreach( var key in httpRouteData.Values.Keys.Where(x=> x.StartsWith(RouteDataValueKeyPrefix,StringComparison.OrdinalIgnoreCase)))
            {
                string facetValueKey = key.Substring(RouteDataValueKeyPrefix.Length);
                var vals = this.GetValues(facetValueKey);

                if (vals == null || !vals.Any(x => string.Equals(x, facetValueKey, StringComparison.OrdinalIgnoreCase)))
                {
                    var valObj = httpRouteData.Values[key];
                   
                    var val = valObj as string ;
                    if ( val != null)
                    {
                        this.Add(facetValueKey, val);
                    }
                    else if (valObj is IEnumerable)
                    {
                        foreach( var subVal in ((IEnumerable)valObj).OfType<string>())
                        {
                            this.Add(facetValueKey, subVal);
                        }
                    }
                    
                }
            }
        }
      
        static readonly Regex _kvpRegex = new Regex(@"(?<key>[^,\:]+)(\:(?<val>[^,]*))?");
        public string ToFacetValueString()
        {
            return ToFacetValueFilter(this);
        }


        string ToFacetValueFilter(NameValueCollection facetValueCollection)
        {
            if (facetValueCollection.Count == 0)
            {
                return "";
            }
            StringBuilder sb = new StringBuilder();
            foreach (string key in facetValueCollection.Keys)
            {
                foreach ( var val in facetValueCollection.GetValues(key))
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
        public  const string RouteDataKey = "facetValueFilter";
        public const string QueryStringKey = "facetValueFilter";
        public const string RouteDataValueKeyPrefix = "facetValue-";


        internal void InitRouteData(System.Web.Http.Routing.IHttpRouteData httpRouteData)
        {
            httpRouteData.Values[RouteDataKey] = this;
            foreach( string key in this.Keys)
            {
                httpRouteData.Values[RouteDataValueKeyPrefix + key] = this[key];
            }
        }

        public static string GetStringFromRequest(HttpRequestMessage requestMessage)
        {
            return Get(requestMessage).ToFacetValueString();
        }

        public static FacetValueFilterCollection Get ( HttpRequestMessage requestMessage)
        {
            FacetValueFilterCollection col = null;
            object tmp;
            var rd = requestMessage.GetRouteData().Values;
            if (rd.TryGetValue(RouteDataKey, out tmp))
            {
                col = (FacetValueFilterCollection)tmp;
            }
            else
            {
                col = new FacetValueFilterCollection(requestMessage);
            }
            col.InitFromRouteData(requestMessage.GetRouteData());
            return col;
        }
    }

    public class SiteBuilderRouteDataInitilizer : DelegatingHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var facetCol = new FacetValueFilterCollection(request);
            facetCol.InitRouteData(request.GetRouteData());
           
            return base.SendAsync(request, cancellationToken);
        }
    }
}