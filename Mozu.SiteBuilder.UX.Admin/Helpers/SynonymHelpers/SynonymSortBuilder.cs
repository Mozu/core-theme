using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.SearchTuningHelpers
{
    public interface ISynonymSortBuilder : ISortExpressionBuilder
    {
    }

    public class SynonymSortBuilder : AbstractSortExpressionBuilder, ISynonymSortBuilder
    {
        protected override string GetFilter(SortingCollectionItem item, bool useSiteContext)
        {
            switch (item.property.ToLowerInvariant())
            {
                case "key":
                    return "key";

                default:
                    throw new InvalidOperationException("unknown sort.property " + item.property);
            }
        }
    }
}