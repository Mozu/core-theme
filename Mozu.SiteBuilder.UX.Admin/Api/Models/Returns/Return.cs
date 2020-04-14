using System;
using System.Collections.Generic;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using OrderNote = Mozu.SiteBuilder.UX.Admin.Api.Models.Order.OrderNote;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Returns
{
    public class Return
    {
        #region Id

        public string Id { get; set; }

        public int? ReturnNumber { get; set; }

        public string ChannelCode { get; set; }

        public string ChannelName { get; set; }

        public string CompanyName { get; set; }

        public string ReturnType { get; set; }

        public string OriginalOrderId { get; set; }

        public string OriginalOrderNumber { get; set; }
        public bool IsUnified { get; set; }
        public string ReturnOrderId { get; set; }

        public List<Order.Order> ReturnOrders { get; set; }

        public int TenantId { get; set; }

        public int SiteId { get; set; }

        public int? CustomerAccountId { get; set; }

        public List<OrderNote> CustomerNotes { get; set; }

        /// <summary>
        /// ???
        /// </summary>
        public string UserId { get; set; }

        #endregion

        public List<string> AvailableActions { get; set; }

        public string Status { get; set; }

        public string ReceiveStatus { get; set; }

        public string RefundStatus { get; set; }

        public string ReplaceStatus { get; set; }

        public List<ReturnItem> Items { get; set; }
        
        public List<OrderNote> Notes { get; set; }

        public List<OrderPayment> Payments { get; set; }

        // This is needed for the returns grid.
        public string CustomerFirstName { get; set; }

        // This is needed for the returns grid.
        public string CustomerLastName { get; set; }

        // This is needed for the returns grid.
        public string CustomerEmail { get; set; }

        public Contact Contact { get; set; }

        public string UpdatedBy { get; set; }

        public string CreatedBy { get; set; }

        public List<ReturnRefund> ReturnRefunds { get; set; }  

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

        /// <summary>
        /// The total product price of all items including product tax.
        /// </summary>
        public decimal? ProductTotal { get; set; }

        public string CurrencyCode { get; set; }

        public Decimal? DefaultProcessingFee { get; set; }
        #endregion


        #region Dates
        public DateTime? RMADeadline { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }
        #endregion

        #region TotalItemQuantities
        public int ItemsReplaced { get; set; }

        public int TotalItemsToReplace { get; set; }

        public int ItemsRefunded { get; set; }

        public int TotalItemsToRefund { get; set; }
        #endregion
     
        public bool ActionRequired { get; set; }
    }
}
