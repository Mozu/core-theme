using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

using AutoMapper;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;

namespace Mozu.SiteBuilder.UX.Hypr.Tags
{
    [NDjango.ParserNodes.Description("tbd")]
    [NDjango.Interfaces.Name("include_products")]
    public class IncludeProductsTag:SimpleTagBase 
    {


        /*
          include_products tag
The include_products tag is a special kind of include tag, that includes a named template, but also sets that template's Model to be a list of products. This is useful on category pages, featured products widgets, and any number of other uses. It has a number of extra argumentss:
•	includeFacets: Set this to true to add a list of available Facets to the Model, which is necessary when building a faceted, drill-down UI. The Model will have a Facets list. Default false.
•	pageWithUrl: Set this to true to use URL parameters for paging. If this is true then the list will use StartIndex and PageSize parameters in the URL if they exist. Default false.
•	sortWithUrl: Set this to true to use URL parameters for sorting. If this is true then the list will use SortAsc or SortDesc parameters in the URL if they exist.
•	startIndex: The initial record to show from the list. It's unusual to set this in the tag, since it should be dynamic and controllable by the user. Default 0.
•	pageSize: The size of each page of the list, i.e. the maximum number of products to return. Default 15.
•	query: You can write a custom query to the product service, e.g. query="StockAvailable < 5". Use context variables from the current Model with the string_format filter, e.g. query="StockAvailable < 5 and categoryId req {0}"|string_format(Model.Id).
•	sort: Thom I don't know how sort works yet
         */

        /// </summary>
        /// <param name="arguments"></param>
        /// <param name="context"></param>
        /// <param name="buffer"></param>
        /// <param name="templateName"></param>
        protected override void ProcessTag(Mvc.Tags.ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
        {
            templateName = buffer = null;
            var template = arguments.GetValueOrDefault<string>("viewName") ?? (string)arguments[0].Value;
            var includeFacets = arguments.GetValueOrDefault<bool>("includeFacets", false);
            var pageWithUrl = arguments.GetValueOrDefault<bool>("pageWithUrl", false);
            var sortWithUrl = arguments.GetValueOrDefault<bool>("sortWithUrl", false);
            var startIndex = arguments.GetValueOrDefault<int>("startIndex", 0);
            var pageSize = arguments.GetValueOrDefault<int>("pageSize", 15);
            var query = arguments.GetValueOrDefault<string>("query");
            var sort = arguments.GetValueOrDefault<string>("sort");
            var productCodes = arguments.GetValueOrDefault<IEnumerable>("productCodes");
            var siteContext = context.SiteBuilderContext();
      

            var searchWebApiClient = context.Resolve<IProductSearchWebApiClient>();
            var request = context.HttpContext().Request;
            var searchQuery = new StringBuilder();
            string facetTemplate = null;

            string facetValueFilter = null;
            string facetHierValue = null;
            string facetHierDepth = null;
            var categoryId = siteContext.PageContext.CategoryId;
            var qurey = "*:*";

            if (query != null)
            {
                searchQuery.Append(query);
            }
            else if (productCodes != null)
            {
                var productCodesFilters = (productCodes ?? Enumerable.Empty<object>()).Cast<object>().Where(x => x != null).Select(x => string.Format("productCode eq {0}", x)).ToArray();

                if (productCodesFilters.Length == 0)
                {
                    templateName = null;
                    return;
                }
                else
                {
                    searchQuery.Append(string.Join(" or ", productCodes));
                }
            }
            else
            {
                if ( categoryId.HasValue )
                {
                    searchQuery.Append("categoryId req ");
                    searchQuery.Append( categoryId.Value );
                }
            }

            if (pageWithUrl)
            {
                int tmp;
                if (int.TryParse(request["pageSize"], out tmp))
                {
                    pageSize = tmp;
                }
                else if (int.TryParse( (siteContext.ThemeSettings["defaultPageSize"] ?? new object()).ToString() , out tmp))
                {
                    pageSize = tmp;
                }
                else
                {
                    pageSize = 15;
                }

               if (int.TryParse(request["startIndex"], out tmp))
               {
                   startIndex = startIndex;
               }
               
            }


            if (includeFacets && categoryId.HasValue )
            {
                facetHierDepth = "categoryId:2";
                facetTemplate= "categoryId:" + categoryId;
                facetHierValue = "categoryId:" + categoryId;
                facetValueFilter = request.QueryString["facetValueFilter"];
            }
            string sortBy = null;
             
            var res = searchWebApiClient.Search(query:qurey,   filter: searchQuery.ToString(),  facetHierValue: facetHierValue, facetTemplate: facetTemplate, facetHierDepth: facetHierDepth, startIndex: startIndex, sortBy: sortBy, pageSize: pageSize).Result;


            var pcDC = res.ReadAsSync();
            var pc = Mapper.Map<ProductSearchResult>(pcDC);
            templateName = template;
            context=context.remove("Model").add(new Tuple<string, object>("Model", pc));
           



        }

      

        //public string ProductListing( HttpRequestBase request , ISiteBuilderContext siteBuilderContext , int? categoryId = null, string sortBy = null, int? startIdx = null, int? itemsPerPage = null, IEnumerable productCodes = null, bool? includeFacets = null, bool? useUrlParams = null)
        //{

        //    IEnumerable<object> _productCodes = productCodes == null ? null : productCodes.Cast<object>();
                
        //        categoryId = categoryId.GetValueOrDefault(-1) < 1 ? null : categoryId;
        //    if (useUrlParams.GetValueOrDefault(false))
        //    {
        //        var itemsPerPageParam = request.QueryString["pageSize"];
        //        var startIndexParam = request.QueryString["startIndex"];
        //        itemsPerPage = String.IsNullOrWhiteSpace(itemsPerPageParam) ? Convert.ToInt32(siteBuilderContext.ThemeSettings["defaultPageSize"]) : Convert.ToInt32(itemsPerPageParam);
        //        startIdx = String.IsNullOrWhiteSpace(startIndexParam) ? 0 : Convert.ToInt32(startIndexParam);
        //    }
        //    else
        //    {
        //        itemsPerPage = itemsPerPage.GetValueOrDefault(Convert.ToInt32(siteBuilderContext.ThemeSettings["defaultPageSize"]));
        //        startIdx = startIdx.GetValueOrDefault(0);
        //    }
        //    var recurse = categoryId.HasValue;
        //    string filter = null;
        //    if (productCodes != null && _productCodes.Count() > 0)
        //    {
        //        var productCodes2 = _productCodes.Select(x => x.ToString()).Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => string.Format("productCode eq {0}", x)).ToList();
        //        if (productCodes2.Count > 0)
        //        {
        //            filter = string.Join(" or ", productCodes2);
        //        }

        //        itemsPerPage = _productCodes.Count();

        //    }
        //    if (categoryId.HasValue)
        //    {
        //        if (!string.IsNullOrWhiteSpace(filter))
        //        {
        //            filter = "(categoryId req " + categoryId + ") and (" + filter + ")";
        //        }
        //        else
        //        {
        //            filter = "categoryId req " + categoryId;
        //        }
        //    }
        //    //todo do i need to replace recurese
        //    // recurse: recurse,
        //    try
        //    {



        //        if (includeFacets.GetValueOrDefault(false) && categoryId.HasValue)
        //        {
        //            string facetValueFilter = request.QueryString["facetValueFilter"];
        //            var pcDC = _searchClient.Search(query: "*:*", filter: filter, startIndex: startIdx, pageSize: itemsPerPage, sortBy: sortBy, facetTemplate: "categoryId:" + categoryId, facetHierValue: "categoryId:" + categoryId, facetHierDepth: "categoryId:2", facetValueFilter: facetValueFilter).Result.ReadAsSync();
        //            var pc = Mapper.Map<ProductSearchResult>(pcDC);
        //            return PartialView(pcDC);
        //        }
        //        else
        //        {
        //            var pcDC = _productClient.GetProducts(filter: filter, startIndex: startIdx, pageSize: itemsPerPage, sortBy: sortBy, responseGroups: "Categories,Measurements,Properties,Options").Result.ReadAsSync();
        //            var pc = Mapper.Map<ProductCollection>(pcDC);
        //            return PartialView(pc);

        //        }

        //        //`
        //        //pc.Paging.CurrentSort = sortBy;
        //        //pc.Paging.StartIndex = startIdx;
        //        //pc.Paging.UrlBase = "?";




        //    }
        //    catch (Exception ex)
        //    {
        //        return new ContentResult() { Content = "[product service error]: " + ex.Message };
        //    }
        //}


        
    }
}