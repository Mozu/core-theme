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
    ///     The include_content tag is a special kind of include tag
    /// </summary>
    [ParserNodes.DescriptionAttribute("tbd")]
    [Name("include_entities")]
    public class IncludeEntitiesTag : SimpleTagBaseAsync
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
            var list = arguments.GetValueOrDefault<string>("collection");
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

            if (ids != null && ids.Count == 0)
            {
                res = (dynamic)(await service.GetEntity(entityListFullName:list, id:ids[0]));
            }
            res = (dynamic)(await service.GetEntities(entityListFullName: list, filter: query, sortBy: sortBy, pageSize: pageSize, startIndex: startIndex));




            object model = null;
            if (res.HasException)
            {
                if (sbContext.IsEditMode)
                {
                    throw (Exception)res.ReadException();
                }

            }
            else if (res.ResponseMessage.IsSuccessStatusCode)
            {
                model = res.ReadAsSync();
            }



            result.Template = template;

            result.Context = context.add(new Tuple<string, object>("model", model));


            return result;
        }


    }
}