using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Returns
{
    public class Return
    {
        #region Id
        public string Id { get; set; }

        public int? ReturnNumber { get; set; }

        public string ReturnType { get; set; }

        public string OriginalOrderId { get; set; }

        public string ReturnOrderId { get; set; }

        public int TenantId { get; set; }

        public int SiteId { get; set; }

        public string UserId { get; set; }
        #endregion

        public List<string> AvailableActions { get; set; }

        public string Status { get; set; }

        public List<ReturnItem> Items { get; set; }

        public string RmaNote { get; set; }

        public List<OrderPayment> Payments { get; set; }

        #region money
        /// <summary>
        /// If this Return was refunded, how much was credited to the shopper? This amount
        /// is summed from the refund payments.        
        /// </summary>
        public decimal? RefundAmount { get; set; }

        /// <summary>
        /// The Product Loss Amount is equal to the (cost of item) * quantity of item returned.
        ///  It is meant to represent the product value to the merchant of the items
        /// damaged or returned by a shopper.
        /// </summary>
        public decimal? ProductLossAmount { get; set; }

        /// <summary>
        /// The Shipping Loss Total is equal to the (shipping cost of item) * quantity
        /// of item returned.  It is meant to represent the product value to the merchant
        /// of the items damaged or returned by a shopper.
        /// </summary>
        public decimal? ShippingLossAmount { get; set; }

        /// <summary>
        /// Sum of the ProductLossTotal and the ShippingLossTotal.
        /// </summary>
        public Decimal? TotalLossAmount { get; set; }
        #endregion

        #region Dates
        public DateTime? RMADeadline { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }
        #endregion
    }
}
