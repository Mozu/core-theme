using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Returns
{
    public class OldReturn
    {
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Id { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<string> AvailableActions { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int? ReturnNumber { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string OriginalOrderId { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ReturnOrderId { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Status { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<OldReturnItem> Items { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<OrderNote> Notes { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string RmaNote { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public DateTime? RMADeadline { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "type")]
        public string ReturnType { get; set; }


		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Decimal? RefundAmount { get; set; }


		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<OrderPayment> Payments { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Decimal TotalLossAmount { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int TenantId { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "siteGroupId")]
        public int? MasterCatalogId { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int SiteId { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string UserId { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public DateTime? CreateDate { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public DateTime? UpdateDate { get; set; }
    }

    public class OldReturnItem
    {
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Decimal? ProductLossAmount { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Decimal? ProductLossTaxAmount { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Decimal? ShippingLossAmount { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Decimal? ShippingLossTaxAmount { get; set; }


		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string OrderItemId { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Reason { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int QuantityReceived { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int QuantityShipped { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int QuantityRestockable { get; set; }


		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<OrderNote> Notes { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string RmaNote { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int Quantity { get; set; }

        /// <summary>
        /// applicable to bundled products.
        /// </summary>
        public string ParentItemId { get; set; }

        public string ProductCode { get; set; }

        /// <summary>
        /// A totally made up thing to help the UI count returned inventory.
        /// </summary>
        public string Key { get; set; }
    }

    public class OldReturnAction
    {
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ActionName { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<string> ReturnIds { get; set; }
    }

}
