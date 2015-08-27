using System.Collections.Generic;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public interface ISortFormatter
    {
        string Format(SortingCollectionItem sortItem);
    }

    //default implementation if used wider than Discount
    //public class SortFormatter : ISortFormatter
    //{
    //    public string Format(SortingCollectionItem sortItem)
    //    {
    //        return (sortItem == null || string.IsNullOrEmpty(sortItem.property))
    //            ? string.Empty 
    //            : sortItem.property.ToLowerInvariant() + GetSortDirection(sortItem);
    //    }

    //    private static string GetSortDirection(SortingCollectionItem sortItem)
    //    {
    //        return ((sortItem.IsAscending) ? " asc" : " desc");
    //    }
    //}
}