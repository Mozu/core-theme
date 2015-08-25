using System;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using Mozu.Core;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.Tenant.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.CouponSetHelpers
{
    internal static class CouponSetFilterExtensions
    {

        private const string DISCOUNT_ID_PROPERTY = "assigneddiscountid";
        private const string NAME_PROPERTY = "name";
        private const string COUPON_SET_CODE_PROPERTY = "couponsetcode";
        private const string COUPON_CODE_TYPE_PROPERTY = "couponcodetype";
        private const string START_DATE_PROPERTY = "startDate";
        private const string END_DATE_PROPERTY = "endDate";
        private const string STATUS_PROPERTY = "status"; // Active, Ended, Scheduled, All // Service is missing this one.
        private const string SET_SIZE_PROPERTY = "setsize";
        private const string MAX_REDEMPTIONS_PROPERTY = "maxredemptionspercouponcode";
        private const string MAX_REDEMPTIONS_PER_USER_PROPERTY = "maxredemptionsperuser"; 

        private enum SymbolNames
        {
            CurrencySymbol,
            PercentSymbol
        }

        /// <summary>
        /// Converts a FilterCollection for Product to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter, IApiContext ctx, NumberFormatInfo masterNumberFormat, ITenantsWebApiClient tenantClient, bool? withVariations = null)
        {
            if (extFilter == null || extFilter.Count == 0)
                return null;

            StringBuilder sb = new StringBuilder();
            foreach (var filter in extFilter.Where(x => x.value != null && !string.IsNullOrEmpty(x.value.ToString())))
            {

                var filterString = GetFilter(filter.value, filter, ctx, masterNumberFormat, tenantClient);
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


        /// <summary>
        /// Returns a regex pattern for matching currencies and percentages based on a passed in CultureInfo.NumberFormatInfo object; Pattern is i18L enabled;
        /// The symbolName defaults to currencies and is optional;
        /// </summary>
        private static string GetUnitPattern(NumberFormatInfo nfi, SymbolNames symbolName = SymbolNames.CurrencySymbol)
        {
            // string unitSymbol = (symbolName == SymbolNames.CurrencySymbol) ? nfi.CurrencySymbol : nfi.PercentSymbol;
            
            // this version allows for any currency symbol. thank you microsoft;
            string unitSymbol = (symbolName == SymbolNames.CurrencySymbol) ? @"\p{Sc}{1}" : nfi.PercentSymbol;

            bool symbolPrecedesIfPositive;

            if (symbolName == SymbolNames.CurrencySymbol)
            {
                /* CurrencyPositivePattern
                 * 0    $n
                 * 1    n$
                 * 2    $ n
                 * 3    n $
                 */
                symbolPrecedesIfPositive = nfi.CurrencyPositivePattern % 2 == 0;
            }
            else
            {
                /* PercentPositivePattern
                 * 0    n %
                 * 1    n%
                 * 2    %n
                 * 3    % n
                 */
                symbolPrecedesIfPositive = (nfi.PercentPositivePattern >= 2);
            }


            string groupSeparator = (symbolName == SymbolNames.CurrencySymbol) ? nfi.CurrencyGroupSeparator : nfi.PercentGroupSeparator;

            string decimalSeparator = (symbolName == SymbolNames.CurrencySymbol) ? nfi.CurrencyDecimalSeparator : nfi.PercentDecimalSeparator;

            //string pattern = Regex.Escape(symbolPrecedesIfPositive ? unitSymbol : "") +
            //           @"\s*[-+]?" + "([0-9]{0,3}(" + groupSeparator + "[0-9]{3})*(" +
            //           Regex.Escape(decimalSeparator) + "[0-9]+)?)" +
            //           (!symbolPrecedesIfPositive ? unitSymbol : "");

            string pattern = (symbolPrecedesIfPositive ? unitSymbol: "") +
                       @"\s*[-+]?" + "([0-9]{0,3}(" + groupSeparator + "[0-9]{3})*(" +
                       Regex.Escape(decimalSeparator) + "[0-9]+)?)" +
                       (!symbolPrecedesIfPositive ? unitSymbol : "");


            return pattern;
        }

        

        private static string GetFilter(object value, FilterCollectionItem filter, IApiContext ctx, NumberFormatInfo masterNumberFormat, ITenantsWebApiClient tenantClient)
        {
            switch (filter.property.ToLowerInvariant())
            {
                case "all":
                    return String.Format("({0} cont \"{2}\") or ({1} eq \"{2}\")", NAME_PROPERTY, COUPON_SET_CODE_PROPERTY, filter.escapedValue);
                case "discountid":
                    return String.Format("{0} eq \"{1}\"", DISCOUNT_ID_PROPERTY, filter.escapedValue);
                case "couponsetname":
                    return String.Format("{0} cont \"{1}\"", NAME_PROPERTY, filter.escapedValue);
                case "couponcodetype":
                    return String.Format("{0} eq \"{1}\"", COUPON_CODE_TYPE_PROPERTY, filter.value);
                case "status":
                    return String.Format("{0} eq \"{1}\"", STATUS_PROPERTY, filter.value);
                case "couponsetcode":
                    return String.Format("{0} eq \"{1}\"", COUPON_SET_CODE_PROPERTY, filter.value);

                case "setsizefrom":
                    return String.Format("{0} ge \"{1}\"", SET_SIZE_PROPERTY, filter.value);
                case "setsizeto":
                    return String.Format("{0} le \"{1}\"", SET_SIZE_PROPERTY, filter.value);


                case "maxredemptionspercouponcodefrom":
                    return String.Format("{0} ge \"{1}\"", MAX_REDEMPTIONS_PROPERTY, filter.value);
                case "maxredemptionspercouponcodeto":
                    return String.Format("{0} le \"{1}\"", MAX_REDEMPTIONS_PROPERTY, filter.value);
                case "maxredemptionsperuserfrom":
                    return String.Format("{0} ge \"{1}\"", MAX_REDEMPTIONS_PER_USER_PROPERTY, filter.value);
                case "maxredemptionsperuserto":
                    return String.Format("{0} le \"{1}\"", MAX_REDEMPTIONS_PER_USER_PROPERTY, filter.value);

                case "startdatefrom":
                    return String.Format("{0} ge \"{1}\"", START_DATE_PROPERTY, ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "startdateto":
                    return String.Format("{0} le \"{1}\"", START_DATE_PROPERTY, ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "enddatefrom":
                    return String.Format("{0} ge \"{1}\"", END_DATE_PROPERTY, ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "enddateto":
                    return String.Format("{0} le \"{1}\"", END_DATE_PROPERTY, ((DateTime)filter.value).ToUniversalTime().ToString("o"));

                default:
                    {
                        throw new NotImplementedException("unable to filter on property " + filter.property);
                    }
            }
        }
    }
}
