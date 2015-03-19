using System;
using System.Collections.Generic;
using Mozu.CommerceRuntime.Contracts.Discounts;
using Newtonsoft.Json;
using DC = Mozu.CommerceRuntime.Contracts.Products;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
  
    public class BundledProduct
    {
        public string ProductCode { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public int Quantity { get; set; }

        public bool IsPackagedStandAlone { get; set; }

        public int? ProductReservationId { get; set; }
     
        public decimal? UnitWeight { get; set; }

        /// <summary>
        /// Physical, DigitalCredit, Digital
        /// </summary>
        public string GoodsType { get; set; }

        /// <summary>
        /// Gift Card Value
        /// </summary>
        public decimal? CreditValue { get; set; }

        /// <summary>
        /// Fully Qualified Name of the selected option's attribute
        /// </summary>
        public string OptionAttributeFQN { get; set; }

        /// <summary>
        /// Value of the selected option
        /// </summary>
        public string OptionValue { get; set; }
    }



    
    public class OrderItem
    {


        public List<BundledProduct> BundledProducts
        {
            get; set;
        }

        public string ProductUsage { get; set; }


        public string Id { get; set; }

        /// <summary>
        /// The line ID of the product. This should be shared with all bundled products if applicable.
        /// </summary>
        public int LineId { get; set; }

        public string ProductCode { get; set; }
        
        // public string OriginalCartItemId { get; set; }

        public List<DC.ProductOption> Options { get; set; }

        public string ProductName { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal ListPrice { get; set; }

        public decimal? SalePrice { get; set; }

        public decimal? UnitWeight { get; set; }

        public int Quantity { get; set; }

        public decimal? HandlingAmount { get; set; }

        public OrderItemDiscount ActiveDiscount { get; set; }

        public List<OrderItemDiscount> Discounts { get; set; }

        //todo: Added to pass mapping unit test, need to review - Greg Murray on 2014-05-19 
        public AppliedProductDiscount ProductDiscount { get; set; }
       
        public ShippingDiscount ActiveShippingDiscount { get; set; }

        public List<ShippingDiscount> ShippingDiscounts { get; set; }

        /// <summary>
        /// Subtotal of this line.
        /// Warning: This is calculated as list price * quantity.
        /// Items which have a sale price may behave unexpectedly.
        /// </summary>
        public decimal Subtotal { get; set; }

        /// <summary>
        /// The subtotal intended to be displayed to the user.
        /// This is: sale/list price * quantity
        /// NOT including line-item discounts.
        /// </summary>
        public decimal DisplaySubtotal { get; set; }

        public decimal Total { get; set; }

        #region Fulfillment shizzle
        public string FulfillmentLocationCode { get; set; }
        
        public string FulfillmentMethod { get; set; }

        public string FulfillmentStatus { get; set; }

        public bool IsPackagedStandAlone { get; set; }
        #endregion

        public string ParentProductCode { get; set; }
    }
}
