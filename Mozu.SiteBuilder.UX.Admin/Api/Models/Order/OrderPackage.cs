using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using System.Text;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    
    public class OrderPackage
    {
        public string Id { get; set; }

        public string OrderId { get; set; }

        public string ShipmentId { get; set; }

        /// <summary>
        /// "NotShipped" or "Shipped"
        /// </summary>
        public string Status { get; set; }

        public string FulfillmentLocationCode { get; set; }

        public string ShippingMethodCode { get; set; }

        public string ShippingMethodName { get; set; }

        public string TrackingNumber { get; set; }

        public string PackagingType { get; set; }

        public decimal? Height { get; set; }

        public decimal? Width { get; set; }

        public decimal? Length { get; set; }

        public decimal? Weight { get; set; }

        public List<OrderPackageItem> Items { get; set; }

        public int TotalQuantity { get; set; }

        #region workflow
        public object AvailableActions { get; set; }
        #endregion

        public DateTime CreateDate { get; set; }

        public DateTime? ShipDate { get; set; }
    }
}
