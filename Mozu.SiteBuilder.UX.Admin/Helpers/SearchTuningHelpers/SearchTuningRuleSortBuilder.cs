using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.SearchTuningHelpers
{
    public interface ISearchTuningRuleSortBuilder :ISortExpressionBuilder
    {
    }

    public class SearchTuningRuleSortBuilder : AbstractSortExpressionBuilder, ISearchTuningRuleSortBuilder
    {
        protected override string GetFilter(SortingCollectionItem item, bool useSiteContext)
        {
            switch (item.property.ToLowerInvariant())
            {
                case "code":
                    return "code";

                case "name":
                    return "name";

                case "startdate":
                    return "startdate";

                case "enddate":
                    return "enddate";

                case "createdate":
                    return "createdate";
               
                case "lastmodifieddate":
                    return "updatedate";
               
                default:
                    throw new InvalidOperationException("unknown sort.property " + item.property);
            }
        }
    }
}