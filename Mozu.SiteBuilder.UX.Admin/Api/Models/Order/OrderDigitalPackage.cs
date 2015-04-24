using System;
using System.Collections.Generic;
using DC = Mozu.CommerceRuntime.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    public class OrderDigitalPackage
    {
        public string Id { get; set; }
        public int LineId { get; set; }
        public string OrderId { get; set; }
        public string Code { get; set; }

        public DateTime CreateDate { get; set; }
        public string FulfillmentEmailAddress { get; set; }
        public DateTime? FulfillmentDate { get; set; }
        public int TotalQuantity { get; set; }
        public List<OrderDigitalPackageItem> Items { get; set; }

        /// <summary>
        /// "Fulfilled", "NotFulfilled", or "PartiallyFulfilled"
        /// </summary>
        public string Status { get; set; }
        
        #region workflow
        public List<string> AvailableActions { get; set; }
        #endregion

        public List<DC.Commerce.ChangeMessage> ChangeMessages { get; set; }
    }
}
