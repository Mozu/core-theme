using System;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using Mozu.Core;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.Tenant.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.CouponCodeHelpers
{
    internal static class CouponCodeFilterExtensions
    {

        private const string COUPON_SET_CODE = "code";
        private const string COUPON_SET_ID = "couponsetid";
        private const string CREATED_BY = "createdby";
        private const string CREATE_DATE = "createdate";
        private const string UPDATE_BY = "updateby";
        private const string UPDATE_DATE = "updatedate";
        


        /// <summary>
        /// Converts a FilterCollection for Product to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter)
        {
            if (extFilter == null || extFilter.Count == 0)
                return null;

            return String.Join(" and ", extFilter.Select(GetFilter));
        }

        private static string GetFilter(FilterCollectionItem filter)
        {
            switch (filter.property.ToLowerInvariant())
            {
                case "all":
                    return String.Format("{0} cont \"{1}\"", COUPON_SET_CODE, filter.escapedValue);
                case "couponsetcode":
                    return String.Format("{0} eq \"{1}\"", COUPON_SET_CODE, filter.escapedValue);
                case "couponsetid":
                    return String.Format("{0} eq \"{1}\"", COUPON_SET_ID, filter.value);
                case "createdby":
                    return String.Format("{0} eq \"{1}\"", CREATED_BY, filter.value);
                case "createdatefrom":
                    return String.Format("{0} ge \"{1}\"", CREATE_DATE, ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "createdateto":
                    return String.Format("{0} le \"{1}\"", CREATE_DATE, ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "updatedby":
                    return String.Format("{0} eq \"{1}\"", UPDATE_BY, filter.value);
                case "updatedatefrom":
                    return String.Format("{0} ge \"{1}\"", UPDATE_DATE, ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "updatedateto":
                    return String.Format("{0} le \"{1}\"", UPDATE_DATE, ((DateTime)filter.value).ToUniversalTime().ToString("o"));


                default:
                    {
                        throw new NotImplementedException("unable to filter on property " + filter.property);
                    }
            }
        }
    }
}
