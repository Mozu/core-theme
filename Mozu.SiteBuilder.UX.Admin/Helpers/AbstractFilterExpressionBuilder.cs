using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using Mozu.Core.EnsureThat;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers
{
    public interface IFilterExpressionBuilder
    {
        string ToFilterString(FilterCollection filterCollection);
    }

    public abstract class AbstractFilterExpressionBuilder
    {
        public virtual string ToFilterString(FilterCollection filterCollection)
        {
            Ensure.That(filterCollection, "filterCollection").IsNotNull();

            if (filterCollection.Count == 0)
                return null;


            StringBuilder sb = new StringBuilder();
            foreach (var filterString in
                filterCollection
                .Where(x => x.value != null && x.property != "all" && !string.IsNullOrEmpty(x.value.ToString()))
                .Select(GetFilter)
                .Where(filterString => !string.IsNullOrWhiteSpace(filterString)))
            {
                if (sb.Length > 1)
                {
                    sb.Append(" and ");
                }
                sb.Append(filterString);
            }

            return sb.ToString().Trim();
        }

        protected abstract string GetFilter(FilterCollectionItem item);
    }
}