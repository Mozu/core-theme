using System;
using System.Linq;
using System.Text;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.DiscountHelpers
{
    internal static class DiscountFilterExtensions
    {
        private const string NAME_PROPERTY = "content.name";
        private const string PRODUCT_CODE_PROPERTY = "target.products.code";
        private const string REQUIRE_COUPON_PROPERTY = "requireCoupon";
        private const string START_DATE_PROPERTY = "startDate";
        private const string END_DATE_PROPERTY = "endDate";

        /// <summary>
        /// Converts a FilterCollection for Product to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter, bool? withVariations = null)
        {
            if (extFilter == null || extFilter.Count == 0)
                return null;


            StringBuilder sb = new StringBuilder();
            foreach (var filter in extFilter.Where(x => x.value != null && x.property != "all" && !string.IsNullOrEmpty(x.value.ToString())))
            {

                var filterString = GetFilter(filter.value, filter);
                if (!string.IsNullOrWhiteSpace(filterString))
                {
                    if (sb.Length > 1)
                    {
                        sb.Append(" and ");
                    }
                    sb.Append(filterString);

                }

            }

            return sb.ToString().Trim();


            //return String.Join(" and ", extFilter./*.Where(f => !String.Equals(f.property, "validondate", StringComparison.InvariantCultureIgnoreCase)).*/Select(GetFilter));
        }

        private static string GetFilter(object value, FilterCollectionItem filter)
        {
            switch (filter.property.ToLowerInvariant())
            {
                case "name":
                    return String.Format("{0} cont \"{1}\"", NAME_PROPERTY, filter.value);
                case "requirecoupon":
                    return String.Format("{0} eq {1}", REQUIRE_COUPON_PROPERTY, filter.value);
                case "productcode":
                    return String.Format("{0} eq \"{1}\"", PRODUCT_CODE_PROPERTY, filter.value);
                case "validondate":
                    return String.Format("{0} lt \"{2}\" and ({1} gt \"{2}\" or {1} eq null)", START_DATE_PROPERTY, END_DATE_PROPERTY, filter.value);
                default:
                    {
                        throw new NotImplementedException("unable to filter on property " + filter.property);
                    }
            }
        }
    }
}
