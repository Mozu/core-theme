using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Globalization;
using Mozu.Core;
using Mozu.Core.Extensions;
using System.Text.RegularExpressions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.Tenant.Contracts.Clients;
using System.Diagnostics;


namespace Mozu.SiteBuilder.UX.Admin.Helpers.DiscountHelpers
{
    internal static class DiscountFilterExtensions
    {
        private const string ID_PROPERTY = "id";
        private const string NAME_PROPERTY = "content.name";
        private const string REQUIRE_COUPON_PROPERTY = "requireCoupon";
        private const string START_DATE_PROPERTY = "startDate";
        private const string END_DATE_PROPERTY = "endDate";
        private const string COUPON_CODE_PROPERTY = "couponcode";
        private const string STATUS_PROPERTY = "status"; // Active, Ended, Scheduled, All // Service is missing this one.
        private const string AMOUNT_PROPERTY = "amount"; // int
        private const string TYPE_PROPERTY = "amounttype"; // Percentage, Amount, Free

        private const string LEVEL_PROPERTY = "scope";  // Order, Lineitem
        private const string USAGE_COUNT_PROPERTY = "CurrentRedemptionCount";
        private const string INCLUDE_ALL_PRODUCTS_PROPERTY = "includeallproducts"; // True, False
        private const string MAX_REDEMPTIONS_PROPERTY = "maxredemptions"; // int
        private const string CURRENT_REDEMPTION_COUNT_PROPERTY = "currentredemptioncount"; // int
        private const string CREATE_DATE_PROPERTY = "createdate"; // int
        private const string CREATED_BY_PROPERTY = "createby"; // str
        private const string UPDATE_DATE_PROPERTY = "updatedate"; // date
        private const string UPDATE_BY_PROPERTY = "updateby"; // str

        // Target Criteria
        private const string TARGET_TYPE_PROPERTY = "target.type"; // Shipping, Product
        private const string TARGET_PRODUCT_CODE_PROPERTY = "target.products.code";
        private const string TARGET_PRODUCTS_ID_PROPERTY = "target.products.id"; // ????
        private const string TARGET_CATEGORIES_ID_PROPERTY = "target.categories.id"; // ????
        private const string TARGET_MINIMUM_LIFETIME_VALUE_AMOUNT_PROPERTY = "target.minimumlifetimevalueamount"; // ????
        private const string TARGET_SHIPPING_METHODS_CODE_PROPERTY = "target.shippingmethods.code";
        private const string TARGET_SHIPPING_ZONES_PROPERTY = "target.shippingzones.zone";
        private const string TARGET_CUSTOMER_GROUPS_ID_PROPERTY = "target.customergroups.id";  // ??

        //Conditions
        private const string CONDITIONS_PRODUCTS_PRODUCTID_PROPERTY = "conditions.productid";  // ??
        private const string CONDITIONS_CATEGORIES_CATEGORYID_PROPERTY = "conditions.categoryid";  // ??

        private enum SymbolNames
        {
            CurrencySymbol,
            PercentSymbol
        }


        private enum DiscountTypes
        {
            Amount,
            Percentage
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

        /// <summary>
        /// Returns a search constraint based on the pattern and type (percentage or currency)
        /// The symbolName defaults to currencies and is optional;
        /// </summary>
        private static string GetUnitMatches(string input, string pattern, DiscountTypes type)
        {
            string retVal = "";

            MatchCollection matches = Regex.Matches(input, pattern, RegexOptions.IgnorePatternWhitespace);

            foreach (Match match in matches)
            {
                var amount = match.Groups[1].Value.Trim();
                if (!amount.IsEmpty())
                {
                    var parseAmount = Decimal.Parse(amount);
                    retVal += String.Format(" or {0} eq '{1}' and {2} eq {3} ", AMOUNT_PROPERTY, parseAmount, TYPE_PROPERTY, type);
                }
            }

            return retVal;
        }

        private static string GetFilter(object value, FilterCollectionItem filter, IApiContext ctx, NumberFormatInfo masterNumberFormat, ITenantsWebApiClient tenantClient)
        {
            switch (filter.property.ToLowerInvariant())
            {
                case "all":

                    var filterValue = filter.value.ToString();
                    var numberFormat = CultureInfo.GetCultureInfo(ctx.LocaleCode).NumberFormat;
                    var currencyPattern = GetUnitPattern(numberFormat);
                    var masterCurrencyPattern = GetUnitPattern(masterNumberFormat);

                    //testing euro pattern;
                    //var israelLocaleCode = CultureInfo.GetCultureInfo("he-IL");                    
                    //var israelNumberFormat = israelLocaleCode.NumberFormat;
                    //var germanLocaleCode = CultureInfo.GetCultureInfo("de-DE");                    
                    //var germanNumberFormat = germanLocaleCode.NumberFormat;
                    //var masterCurrencyPattern = GetUnitPattern(germanNumberFormat);

                    var percentPattern = GetUnitPattern(numberFormat, SymbolNames.PercentSymbol);
                    var masterPercentPattern = GetUnitPattern(masterNumberFormat, SymbolNames.PercentSymbol);

                    var retVal = String.Format("{0} cont '{2}' or {1} cont '{2}'", NAME_PROPERTY, COUPON_CODE_PROPERTY, filter.escapedValue);

                    // Note: do not escape the value for the following currency and percent filters as the escaped version will cause propblems with the regex;

                    // check for currencies in the search string using the current site context;
                    retVal += GetUnitMatches(filterValue, currencyPattern, DiscountTypes.Amount);

                    // if the context's currency pattern varies from the master pattern we need to support both. criminy.
                    if (!currencyPattern.Equals(masterCurrencyPattern))
                    {
                        retVal += GetUnitMatches(filterValue, masterCurrencyPattern, DiscountTypes.Amount);
                    }

                    // check for percentages in the search string using the current site context;
                    retVal += GetUnitMatches(filterValue, percentPattern, DiscountTypes.Percentage);

                    // if the context's percent pattern varies from the master pattern we need to support both. 
                    if (!percentPattern.Equals(masterPercentPattern))
                    {
                        retVal += GetUnitMatches(filterValue, masterPercentPattern, DiscountTypes.Percentage);
                    }

                    return retVal;
                case "discountname":
                    return String.Format("{0} cont \"{1}\"", NAME_PROPERTY, filter.escapedValue);
                case "id":
                    return String.Format("{0} cont \"{1}\"", ID_PROPERTY, filter.value);
                case "couponcode":
                    return String.Format("{0} cont \"{1}\"", COUPON_CODE_PROPERTY, filter.escapedValue);
                case "status":
                    return String.Format("{0} eq \"{1}\"", STATUS_PROPERTY, filter.value);
                case "amount":
                    return String.Format("{0} eq \"{1}\"", AMOUNT_PROPERTY, filter.value);
                case "type":
                    return String.Format("{0} eq \"{1}\"", TYPE_PROPERTY, filter.value);
                case "effect":
                    return String.Format("{0} eq \"{1}\"", TARGET_TYPE_PROPERTY, filter.value);
                case "level":
                    return String.Format("{0} eq \"{1}\"", LEVEL_PROPERTY, filter.value);
                case "usagecountfrom":
                    return String.Format("{0} ge \"{1}\"", USAGE_COUNT_PROPERTY, filter.value);
                case "usagecountto":
                    return String.Format("{0} le \"{1}\"", USAGE_COUNT_PROPERTY, filter.value);
                case "startdatefrom":
                    return String.Format("{0} gt \"{1}\"", START_DATE_PROPERTY, ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "startdateto":
                    return String.Format("{0} lt \"{1}\"", START_DATE_PROPERTY, ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "enddatefrom":
                    return String.Format("{0} gt \"{1}\"", END_DATE_PROPERTY, ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "enddateto":
                    return String.Format("{0} lt \"{1}\"", END_DATE_PROPERTY, ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "requirecoupon":
                    return String.Format("{0} eq {1}", REQUIRE_COUPON_PROPERTY, filter.value);
                case "productcode":
                    return String.Format("{0} eq \"{1}\"", TARGET_PRODUCT_CODE_PROPERTY, filter.value);
                case "includeallproducts":
                    return String.Format("{0} eq \"{1}\"", INCLUDE_ALL_PRODUCTS_PROPERTY, filter.value);
                case "maxredemptions":
                    return String.Format("{0} eq \"{1}\"", MAX_REDEMPTIONS_PROPERTY, filter.value);
                case "currentredemptioncount":
                    return String.Format("{0} eq \"{1}\"", CURRENT_REDEMPTION_COUNT_PROPERTY, filter.value);
                case "createdate":
                    return String.Format("{0} eq \"{1}\"", CREATE_DATE_PROPERTY, ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "createby":
                    return String.Format("{0} eq \"{1}\"", CREATED_BY_PROPERTY, filter.value);
                case "updatedate":
                    return String.Format("{0} eq \"{1}\"", UPDATE_DATE_PROPERTY, ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "updateby":
                    return String.Format("{0} eq \"{1}\"", UPDATE_BY_PROPERTY, filter.value);
                case "productsid":
                    return String.Format("{0} eq \"{1}\"", TARGET_PRODUCTS_ID_PROPERTY, filter.value);
                case "categoriesid":
                    return String.Format("{0} eq \"{1}\"", TARGET_CATEGORIES_ID_PROPERTY, filter.value);
                case "minimumlifetimevalueamount":
                    return String.Format("{0} eq \"{1}\"", TARGET_MINIMUM_LIFETIME_VALUE_AMOUNT_PROPERTY, filter.value);
                case "shippingmethodscode":
                    return String.Format("{0} eq \"{1}\"", TARGET_SHIPPING_METHODS_CODE_PROPERTY, filter.value);
                case "shippingzones":
                    return String.Format("{0} eq \"{1}\"", TARGET_SHIPPING_ZONES_PROPERTY, filter.value);
                case "customergroupsid":
                    return String.Format("{0} eq \"{1}\"", TARGET_CUSTOMER_GROUPS_ID_PROPERTY, filter.value);
                case "conditionsproductid":
                    return String.Format("{0} eq \"{1}\"", CONDITIONS_PRODUCTS_PRODUCTID_PROPERTY, filter.value);
                case "conditionscategoryid":
                    return String.Format("{0} eq \"{1}\"", CONDITIONS_CATEGORIES_CATEGORYID_PROPERTY, filter.value);
                case "validondate":
                    return String.Format("{0} lt \"{2}\" and ({1} gt \"{2}\" or {1} eq null)", START_DATE_PROPERTY, END_DATE_PROPERTY, DateTime.Parse((string)filter.value).ToUniversalTime().ToString("o"));
                default:
                    {
                        throw new NotImplementedException("unable to filter on property " + filter.property);
                    }
            }
        }
    }
}
