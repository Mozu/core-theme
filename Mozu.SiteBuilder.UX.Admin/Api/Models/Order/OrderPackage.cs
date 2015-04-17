using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using System.Text;
using DC = Mozu.CommerceRuntime.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    
    public class OrderPackage
    {
        public string Id { get; set; }

        //todo: to pass mapping unit test, please review or add ignore - Greg Murray on 2014-05-21 
        public string Code { get; set; }

        public int LineId { get; set; }

        public string OrderId { get; set; }

        public string ShipmentId { get; set; }

        public bool HasLabel { get; set; }


        /// <summary>
        /// "Fulfilled", "NotFulfilled", or "PartiallyFulfilled"
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
        public List<string> AvailableActions { get; set; }
        #endregion

        public DateTime CreateDate { get; set; }

        public DateTime? FulfillmentDate { get; set; }

        // deprecated
        public DateTime? ShipDate { get; set; }


        public List<DC.Commerce.ChangeMessage> ChangeMessages { get; set; }

    }
}
