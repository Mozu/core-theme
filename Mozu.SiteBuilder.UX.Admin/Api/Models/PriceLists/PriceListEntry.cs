using System;
using Mozu.Core.Api.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.PriceLists
{
    public class PriceListEntry
    {
        public string PriceListCode { get; set; }

        public string ProductCode { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public int Mode { get; set; }

        public string CurrencyCode { get; set; }

        #region Restricted Discounts
        /// <summary>
        /// Default is false, when true dates may apply, null dates mean beginning/end of time
        /// </summary>
        public bool DiscountsRestricted { get; set; }

        /// <summary>
        /// If discount restricted, then start date of restriction or null to indicate indefinite
        /// </summary>
        public DateTime? DiscountsRestrictedStartDate { get; set; }

        /// <summary>
        /// If discount restricted, then end date of restriction or null to indicate indefinite
        /// </summary>
        public DateTime? DiscountsRestrictedEndDate { get; set; }

        #endregion

        public string CreateBy { get; set; }

        public DateTime? CreateDate { get; set; }

        public string UpdateBy { get; set; }

        public DateTime? UpdateDate { get; set; }

    }
}