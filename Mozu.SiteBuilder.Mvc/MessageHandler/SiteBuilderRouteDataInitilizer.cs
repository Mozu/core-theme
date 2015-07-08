using Mozu.SiteBuilder.Mvc.Contexts;
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
    //public class SearchContext 
    //{

    //    public NameValueCollection Facets { get; set; }
    //    public SearchContext(HttpRequestMessage request)
    //    {
    //        Facets = new NameValueCollection(StringComparer.OrdinalIgnoreCase);
    //        InitFromQstring(request);
    //        InitFromRouteData(request.GetRouteData());
    //    }
        
    //    private void InitFromQstring(HttpRequestMessage request)
    //    {
    //        var qs = request.RequestUri.ParseQueryString();
    //        var facetValueQsValue = qs[SearchContext.QueryStringKey];
    //        if (!string.IsNullOrWhiteSpace(facetValueQsValue))
    //        {
    //            var matchesw = KvpRegex.Matches(facetValueQsValue);
    //            foreach (Match m in matchesw)
    //            {
    //                this.Facets.Add(m.Groups["key"].Value, m.Groups["val"].Value);
    //            }
    //        }
    //        int tempInt;
    //        var temp = qs["pageSize"];
    //        if (int.TryParse(temp, out tempInt))
    //        {
    //            this.PageSize = tempInt;
    //        }
    //        temp = qs["startIndex"];
    //        if (int.TryParse(temp, out tempInt))
    //        {
    //            this.StartIndex = (int?)tempInt;
    //        }
    //        temp = qs["sortBy"];
    //        if (!string.IsNullOrWhiteSpace(temp))
    //        {
    //            this.SortBy = temp;
    //        }

    //        temp = qs["query"];
    //        if (!string.IsNullOrWhiteSpace(temp))
    //        {
    //            this.Query = temp;
    //        }


    //        return;
    //    }
    //    private void InitFromRouteData(System.Web.Http.Routing.IHttpRouteData httpRouteData)
    //    {
    //        foreach (var key in httpRouteData.Values.Keys.Where(x => x.StartsWith(RouteDataValueKeyPrefix, StringComparison.OrdinalIgnoreCase)))
    //        {
    //            string facetValueKey = key.Substring(RouteDataValueKeyPrefix.Length);
    //            var vals = this.Facets.GetValues(facetValueKey);

    //            if (vals != null && vals.Any(x => string.Equals(x, facetValueKey, StringComparison.OrdinalIgnoreCase)))
    //                continue;
    //            var valObj = httpRouteData.Values[key];

    //            var val = valObj as string;
    //            if (val != null)
    //            {
    //                this.Facets.Add(facetValueKey, val);
    //            }
    //            else
    //            {
    //                var obj = valObj as IEnumerable;
    //                if (obj == null)
    //                {
    //                    continue;
    //                }
    //                foreach (var subVal in obj.OfType<string>())
    //                {
    //                    this.Facets.Add(facetValueKey, subVal);
    //                }
    //            }
    //        }


    //        object temp;
    //        if (httpRouteData.Values.TryGetValue("pageSize", out temp) && (!string.IsNullOrWhiteSpace(temp as string) || temp is int))
    //        {
    //            this.PageSize = Convert.ToInt32(temp);
    //        }
    //        if (httpRouteData.Values.TryGetValue("startIndex", out temp) && (!string.IsNullOrWhiteSpace(temp as string) || temp is int))
    //        {
    //            this.StartIndex = Convert.ToInt32(temp);
    //        }
    //        if (httpRouteData.Values.TryGetValue("sortBy", out temp) && !string.IsNullOrWhiteSpace(temp as string))
    //        {
    //            this.SortBy = (string)temp;
    //        }
    //        if (httpRouteData.Values.TryGetValue("query", out temp) && !string.IsNullOrWhiteSpace(temp as string))
    //        {
    //            this.SortBy = (string)temp;
    //        }

    //    }

    //    static readonly Regex KvpRegex = new Regex(@"(?<key>[^,\:]+)(\:(?<val>[^,]*))?");
    //    public string ToFacetValueFilter()
    //    {
    //        if (this.Facets.Count == 0)
    //        {
    //            return "";
    //        }
    //        StringBuilder sb = new StringBuilder();
    //        foreach (string key in this.Facets.Keys)
    //        {
    //            foreach (var val in this.Facets.GetValues(key))
    //            {
    //                if (sb.Length > 0)
    //                {
    //                    sb.Append(",");
    //                }
    //                sb.Append(key);
    //                sb.Append(':');
    //                sb.Append(val);
    //            }

    //        }
    //        return sb.ToString();
    //    }
    //    public const string RouteDataKey = "facetValueFilter";
    //    public const string QueryStringKey = "facetValueFilter";
    //    public const string RouteDataValueKeyPrefix = "facetValue-";


    //    internal void InitRouteData(System.Web.Http.Routing.IHttpRouteData httpRouteData)
    //    {
    //        httpRouteData.Values[RouteDataKey] = this;
    //        foreach (string key in this.Facets.Keys)
    //        {
    //            httpRouteData.Values[RouteDataValueKeyPrefix + key] = this.Facets[key];
    //        }
    //    }

    //    public static string GetStringFromRequest(HttpRequestMessage requestMessage)
    //    {
    //        return Get(requestMessage).ToFacetValueFilter();
    //    }

    //    public static SearchContext Get(HttpRequestMessage requestMessage)
    //    {
    //        SearchContext col = null;
    //        object tmp;
    //        var rd = requestMessage.GetRouteData().Values;
    //        if (rd.TryGetValue(RouteDataKey, out tmp))
    //        {
    //            col = (SearchContext)tmp;
    //        }
    //        else
    //        {
    //            col = new SearchContext(requestMessage);
    //        }
    //        col.InitFromRouteData(requestMessage.GetRouteData());
    //        return col;
    //    }

    //    public int? StartIndex { get; set; }
    //    public string SortBy { get; set; }
    //    public int? PageSize { get; set; }
    //    public string Query { get; set; }
    //}

    public class SiteBuilderRouteDataInitilizer : DelegatingHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
           // var facetCol = new SearchContext(request);
          //  facetCol.InitRouteData(request.GetRouteData().Values);

            return base.SendAsync(request, cancellationToken);
        }
    }
}