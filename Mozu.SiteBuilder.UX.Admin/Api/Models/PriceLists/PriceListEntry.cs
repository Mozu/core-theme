using System;
using System.Collections.Generic;
using Mozu.Core.Api.Contracts;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.PriceLists
{
    public class PriceListEntry
    {

        public string PriceListCode { get; set; }

        public string ProductCode { get; set; }

        public string CurrencyCode { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public string PriceListEntryMode { get; set; }

        public List<PriceListEntryPrice> PriceEntries { get; set; }

        #region Restricted Discounts
        /// <summary>
        /// Default is false, when true dates may apply, null dates mean beginning/end of time
        /// </summary>
        public bool? DiscountsRestricted { get; set; }

        /// <summary>
        /// If discount restricted, then start date of restriction or null to indicate indefinite
        /// </summary>
        public DateTime? DiscountsRestrictedStartDate { get; set; }

        /// <summary>
        /// If discount restricted, then end date of restriction or null to indicate indefinite
        /// </summary>
        public DateTime? DiscountsRestrictedEndDate { get; set; }

        #endregion

        /// <summary>
        /// Manufacturer Suggested Retail Price
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "msrp")]
        public decimal? MSRP { get; set; }

        /// <summary>
        /// MSRP Mode
        /// </summary>
        /// 
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "msrpMode")]
        public string MSRPMode { get; set; }

        public decimal? Cost { get; set; }

        public string CostMode { get; set; }

        #region MAP

        /// <summary>
        /// Minimum Advertised Price
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "map")]
        public decimal? MAP { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "mapMode")]
        public string MAPMode { get; set; }

        /// <summary>
        /// Minimum Advertised Price Start Date
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "mapStartDate")]
        public DateTime? MAPStartDate { get; set; }

        /// <summary>
        /// Minimum Advertised Price End Date
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "mapEndDate")]
        public DateTime? MAPEndDate { get; set; }

        #endregion

        #region AuditInfo

        public string CreateBy { get; set; }

        public DateTime? CreateDate { get; set; }

        public string UpdateBy { get; set; }

        public DateTime? UpdateDate { get; set; }

        #endregion

    }
}