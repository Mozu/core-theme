using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers
{
    public interface ISortExpressionBuilder
    {
        string ToSortString(SortingCollection sortCollection, bool useSiteContext = false);
    }
}