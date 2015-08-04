using System.Linq;
using System.Text;
using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.CouponSetHelpers
{
    public static class CouponSetPagingParametersExtensions
    {
        /// <summary>
        /// Extension to return api syntax sort.  Could potentially be move to general folder or added to PaingParameters explicitly.
        /// </summary>
        /// <param name="paging"></param>
        /// <param name="sortFormatter">Implementation to provide formatting and any mapping</param>
        /// <returns>null if empty</returns>
        public static string ToSort(this PagingParamaters paging, ISortFormatter sortFormatter)
        {
            if (paging == null || paging.sort == null || ! paging.sort.Any())
                return null;
            var items = paging.sort.ToArray();
            var sb = new StringBuilder();
            for (int i = 0; i < items.Length; i++)
            {
                if (i > 0)
                    sb.Append(",");
                sb.Append(sortFormatter.Format(items[i]));
            }
            return sb.ToString();
        }

    }
}
