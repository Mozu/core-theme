using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    [DataContract]
    public class OrderPickup
    {
        /// <summary>
        /// ID of the pickup.
        /// </summary>
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "orderId", EmitDefaultValue = true)]
        public string OrderId { get; set; }

        /// <summary>
        /// Status of the pickup
        /// </summary>
        [DataMember(Name = "status")]
        public string Status { get; set; }

        /// <summary>
        /// List of items in the pickup
        /// </summary>
        [DataMember(Name = "items")]
        public List<OrderPickupItem> Items { get; set; }

        /// <summary>
        /// Date of the pickup
        /// </summary>
        [DataMember(Name = "fulfillmentDate")]
        public DateTime? FulfillmentDate { get; set; }

        [DataMember(Name = "fulfillmentLocationCode")]
        public string FulfillmentLocationCode { get; set; }

        [DataMember(Name = "availableActions")]
        public List<string> AvailableActions { get; set; }

        [DataMember(Name = "totalQuantity", EmitDefaultValue = true)]
        public int TotalQuantity { get; set; }
    }
}
