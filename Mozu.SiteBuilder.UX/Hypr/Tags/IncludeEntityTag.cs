using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Collections;
using Mozu.MZDB.Contracts;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Caching;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using NDjango;
using NDjango.Interfaces;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NDjango.FiltersCS.Compatibility;

namespace Mozu.SiteBuilder.UX.Hypr.Tags
{
    /// <summary>
    /// The include_products tag is a special kind of include tag, that includes a named template, 
    /// but also sets that template's Model to be a entity list collection
    /// and any number of other uses. 
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
    /// startIndex=refer to mzdb entity list api documentation
    /// 
    /// pageSize=refer to mzdb entity list api documentation
    /// 
    /// query=refer to mzdb entity list api documentation
    /// 
    /// sort=refer to mzdb entity list api documentation
    /// 
    /// listFQN the fully qualified name of the entity list
    /// 
    /// view= optional entity view to use 
    /// </summary>
    [ParserNodes.DescriptionAttribute("tbd")]
    [Name("include_entities")]
    public class IncludeEntitiesTag : SimpleTagBaseAsync
    {
        protected override async Task<IEnumerable<WalkResult>> ProcessTagAsync(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunction)
        {
            var result = new ProcessTagResult(context);
            var sbContext = context.SiteBuilderApiContext();
            string template = arguments.GetValueOrDefault<string>("viewName") ?? (string) arguments[0].Value;

            bool pageWithUrl = arguments.GetValueOrDefault("pageWithUrl", false);
            bool sortWithUrl = arguments.GetValueOrDefault("sortWithUrl", false);
            int startIndex = arguments.GetValueOrDefault("startIndex", 0);
            int pageSize = arguments.GetValueOrDefault("pageSize", 15);
            var query = arguments.GetValueOrDefault<string>("query");
            var sortBy = arguments.GetValueOrDefault<string>("sort");
            var list = arguments.GetValueOrDefault<string>("listFQN");
            var view = arguments.GetValueOrDefault<string>("view");

            var tempCol = arguments.GetValueOrDefault<IEnumerable>("ids");
            List<string> ids = null;
            if (tempCol != null)
            {
                ids = tempCol.Cast<object>().Where(x => x != null).Select(x => x.ToString()).ToList();
                query = string.Join(", or", ids.Select(x => string.Format("Id eq \"{0}\"", x)));
                ;
            }
            var service = context.Resolve<Mozu.MZDB.Contracts.Clients.IEntityListsWebApiClient>();

            var siteContext = context.SiteContext();
            var request = context.HttpContext().Request;
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
            
            dynamic res;
            if (ids != null && ids.Count == 0)
            {
                res = await service.GetEntity(entityListFullName: list, id: ids[0]);
            }
            else
            {
                res = await service.GetEntities(entityListFullName: list, filter: query, sortBy: sortBy, pageSize: pageSize, startIndex: startIndex);
            }

            object model = null;
            if (res.HasException)
            {
                if (sbContext.IsEditMode)
                {
                    //todo add in after demo
                   // throw (Exception)res.ReadException();
                }

            }
            else if (res.ResponseMessage.IsSuccessStatusCode)
            {
                model = res.ReadAsSync();
            }

            if (model is EntityCollection)
            {
                model = new PagedCollection<JObject>(((EntityCollection) model).Items)
                        {
                            PageSize = ((EntityCollection)model).PageSize,
                            StartIndex = ((EntityCollection)model).StartIndex,
                            TotalCount = ((EntityCollection)model).TotalCount
                        };
            }

            var dict = new Dictionary<string, object> { { "model", model } };
            var nodes = getTemplateFunction(template).Nodes;
            return new[] { WalkResultHelpers.RenderNodesWithContextMods(nodes, dict, Enumerable.Empty<string>()) };
        }
    }
}