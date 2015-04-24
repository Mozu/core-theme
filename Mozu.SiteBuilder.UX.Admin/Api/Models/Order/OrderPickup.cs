using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using System.Text;
using DC = Mozu.CommerceRuntime.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    
    public class OrderPickup
    {
        /// <summary>
        /// ID of the pickup.
        /// </summary>
        public string Id { get; set; }

        public int LineId { get; set; }

        public string OrderId { get; set; }

        public string Code { get; set; }

        /// <summary>
        /// Status of the pickup
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        /// List of items in the pickup
        /// </summary>
        public List<OrderPickupItem> Items { get; set; }

        /// <summary>
        /// Date of the pickup
        /// </summary>
        public DateTime? FulfillmentDate { get; set; }

        public string FulfillmentLocationCode { get; set; }

        public List<string> AvailableActions { get; set; }

        public int TotalQuantity { get; set; }

        public List<DC.Commerce.ChangeMessage> ChangeMessages { get; set; }
    }
}
