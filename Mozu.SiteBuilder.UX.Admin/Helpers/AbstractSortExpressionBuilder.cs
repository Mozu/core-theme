using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers
{
    public abstract class AbstractSortExpressionBuilder
    {
        /// <summary>
        ///     Converts a SortingCollection to a mozu services-compatible sort string.
        /// </summary>
        /// <param name="useSiteContext">
        ///     By default, sort occurs on global-level
        ///     Pass true to force sort on content and price fields nested inside ProductInCatalogs.
        /// </param>
        public string ToSortString(SortingCollection sortCollection, bool useSiteContext = false)
        {
            if (sortCollection == null)
                return GetDefaultSort();
            return string.Join(" and ",
                sortCollection.Select(x => GetFilter(x, useSiteContext) + (x.IsAscending ? " asc" : " desc")));
        }

        protected abstract string GetFilter(SortingCollectionItem item, bool useSiteContext);

        protected virtual string GetDefaultSort()
        {
            return String.Empty;
        }
    }
}