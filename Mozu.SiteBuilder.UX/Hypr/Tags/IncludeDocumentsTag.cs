using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mozu.Content.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Tags;
using NDjango;
using NDjango.Interfaces;
using NDjango.FiltersCS.Compatibility;
using Mozu.Core.Api.Client;
using Mozu.SiteBuilder.Mvc;

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
    [ParserNodes.Description("tbd")]
    [Name("include_documents")]
    public class IncludeDocumentsTag : SimpleTagBaseAsync
    {
        protected override async Task<IEnumerable<WalkResult>> ProcessTagAsync(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunction)
        {
            var result = new ProcessTagResult(context);
            var sbContext = context.SiteBuilderApiContext();

            var template = arguments.GetValueOrDefault<string>("viewName") ?? (string) arguments[0].Value;


            var pageWithUrl = arguments.GetValueOrDefault("pageWithUrl", false);
            var sortWithUrl = arguments.GetValueOrDefault("sortWithUrl", false);
            var startIndex = arguments.GetValueOrDefault("startIndex", 0);
            var pageSize = arguments.GetValueOrDefault("pageSize", 15);
            var query = arguments.GetValueOrDefault<string>("query", arguments.GetValueOrDefault<string>("filter"));
            var sortBy = arguments.GetValueOrDefault<string>("sort");
            var list = arguments.GetValueOrDefault<string>("listFQN");
            var view = arguments.GetValueOrDefault<string>("view") ?? "default";

            var tempCol = arguments.GetValueOrDefault<IEnumerable>("ids");
            var id = arguments.GetValueOrDefault<string>("id");
            
            List <string> docIds = null;
            if (tempCol != null)
            {
                docIds = tempCol.Cast<object>().Where(x => x != null).Select(x => x.ToString()).ToList();
                query = string.Join( ", or", docIds.Select(x => $"ID eq \"{x}\""));
            }
            if (!string.IsNullOrEmpty(id))
            {
                query = $"id eq \"{id}\"";
            }
            var service = context.Resolve<IDocumentListWebApiClient>();
            var siteContext = context.SiteContext();
            var request = context.HttpContext().Request;
           

            if (pageWithUrl)
            {
                if (int.TryParse(request.Query["pageSize"], out int tmp))
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

                if (int.TryParse(request.Query["startIndex"], out tmp))
                {
                    startIndex = tmp;
                }
            }

            // staying in line with the admin-side doc client
            if(sbContext.DataViewMode == Core.DataViewModeType.Pending)
            {
                service = service.CloneWithConfigOptions(opts => opts.DisableCache = true).CloneWithApiContext(ctx =>
                {
                    ctx.ShouldBypassCache = true;
                    ctx.ShouldUpdateCache = false;
                });
            }

            var res = await service.GetViewDocuments(documentListName: list, viewName: view, filter: query, sortBy: sortBy, pageSize: pageSize, startIndex: startIndex, includeInactive: sbContext.IsEditMode).ConfigureAwait(false);
       
            object model = null;
            if (res.HasException && (sbContext.IsDebugMode || sbContext.DebugFlags.HasFlag(DebugModeFlagValues.ShowErrors)))
            {
                throw res.ReadException();
            }

            if ( res.ResponseMessage.IsSuccessStatusCode)
            {
               model = res.ReadAsSync();
            }

            var dict = new Dictionary<string, object> { { "model", model } };
            var nodes = getTemplateFunction(template).Nodes;
            return new[] { WalkResultHelpers.RenderNodesWithContextMods(nodes, dict, Enumerable.Empty<string>())};
        }
    }
}