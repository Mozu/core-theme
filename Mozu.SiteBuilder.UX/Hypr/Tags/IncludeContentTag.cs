using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Contracts.Client;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Caching;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using NDjango;
using NDjango.Interfaces;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Hypr.Tags
{
    /// <summary>
    /// The include_documents tag is a special kind of include tag, that includes a named template, 
    /// but also sets that template's Model to be a document list result 
    /// 
    /// It has a number of extra argumentss:
    /// 
    /// 
    /// viewName=the path to the template
    /// 
    /// 
    /// pageWithUrl=Set this to true to use URL parameters for paging. 
    /// If this is true then the list will use StartIndex and PageSize parameters in the URL if they exist. 
    /// Default false.
    /// 
    /// sortWithUrl=Set this to true to use URL parameters for sorting. 
    /// If this is true then the list will use SortAsc or SortDesc parameters in the URL if they exist.
    /// 
    /// startIndex=refer to  content document list  documentation
    /// 
    /// pageSize=refer to content document list  documentation
    /// 
    /// query=refer to content document list api documentation
    /// 
    /// sort=refer to  content document list  documentation
    /// 
    /// listFQN the fully qualified name of the document list
    /// 
    /// view= optional entity view to use 
    /// </summary>
    [ParserNodes.DescriptionAttribute("tbd")]
    [Name("include_documents")]
    public class IncludeContentTag : SimpleTagBaseAsync
    {
        protected override async Task<ProcessTagResult> ProcessTagAsync(ArgumentCollection arguments, IContext context)
        {
            var result = new ProcessTagResult(context);
            var sbContext = context.SiteBuilderApiContext();
            var cache = context.Resolve<IStorefrontCache>();

            string template = arguments.GetValueOrDefault<string>("viewName") ?? (string) arguments[0].Value;


            bool pageWithUrl = arguments.GetValueOrDefault("pageWithUrl", false);
            bool sortWithUrl = arguments.GetValueOrDefault("sortWithUrl", false);
            int startIndex = arguments.GetValueOrDefault("startIndex", 0);
            int pageSize = arguments.GetValueOrDefault("pageSize", 15);
            var query = arguments.GetValueOrDefault<string>("query");
            var sortBy = arguments.GetValueOrDefault<string>("sort");
            var list = arguments.GetValueOrDefault<string>("listFQN");
            var view = arguments.GetValueOrDefault<string>("view") ?? "default";

            var tempCol = arguments.GetValueOrDefault<IEnumerable>("ids");
            var id = arguments.GetValueOrDefault<string>("id");

            List <string> docIds = null;
            if (tempCol != null)
            {
                docIds = tempCol.Cast<object>().Where(x => x != null).Select(x => x.ToString()).ToList();
                query = string.Join( ", or", docIds.Select(x => string.Format("ID eq \"{0}\"", x)));
                ;
            }
            if (!string.IsNullOrEmpty(id))
            {
                query = string.Format("id eq \"{0}\"", id);
            }
            var service = context.Resolve<IDocumentListWebApiClient>();





            PageContext pageContext = context.PageContext();
            SiteContext siteContext = context.SiteContext();
            var searchWebApiClient = context.Resolve<IProductSearchWebApiClient>();
            HttpRequestBase request = context.HttpContext().Request;
            var searchQuery = new StringBuilder();
         
          

            if (pageWithUrl)
            {
                int tmp;
                if (int.TryParse(request["pageSize"], out tmp))
                {
                    pageSize = tmp;
                }
                else if (int.TryParse((siteContext.ThemeSettings["defaultPageSize"] ?? new object()).ToString(), out tmp))
                {
                    pageSize = tmp;
                }
                else
                {
                    pageSize = 15;
                }

                if (int.TryParse(request["startIndex"], out tmp))
                {
                    startIndex = tmp;
                }
            }

            dynamic res = null;

            if (docIds != null && docIds.Count==0)
            {
            
                //res = (dynamic)(await service.GetViewDocument(documentListName: list, viewName:view, documentId: docIds[0]));
            }
            else
            {
                res = (dynamic)(await service.GetViewDocuments(documentListName: list, viewName: view, filter: query, sortBy: sortBy, pageSize: pageSize, startIndex: startIndex));    
            }
            




            object  model = null;
            if (res.HasException)
            {
                if (sbContext.IsEditMode)
                {
                    throw (Exception)res.ReadException();
                }
              
            }
            else if ( res.ResponseMessage.IsSuccessStatusCode)
            {
               model = res.ReadAsSync();
            }

          

            result.Template = template;

            result.Context = context.add(new Tuple<string, object>("model", model));
          

            return result;
        }


    }
}