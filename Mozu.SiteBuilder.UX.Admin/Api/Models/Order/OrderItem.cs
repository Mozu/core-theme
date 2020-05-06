using System;
using System.Collections.Generic;
using Mozu.CommerceRuntime.Contracts.Discounts;
using Newtonsoft.Json;
using DC = Mozu.CommerceRuntime.Contracts.Products;
using System.Linq;
using Newtonsoft.Json.Linq;

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

        /// <summary>
        /// Value of the LineId
        /// </summary>
        public int LineId { get; set; }
        


        /// <summary>
        /// FulfillmentStatus of the BundledProduct
        /// </summary>
        public string FulfillmentStatus { get; set; }

        /// <summary>
        /// Only populated for extras
        /// </summary>
        public decimal? DeltaPrice { get; set; }

        public OrderItemStock Stock { get; set; }

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

        public List<OrderItemDiscount> ActiveDiscounts { get; set; }

        public OrderItemStock Stock { get; set; }

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

        public decimal? DutyAmount { get; set; }

        /// <summary>
        /// Pricelist code for the product
        /// </summary>
        public string PriceListCode { get; set; }

        /// <summary>
        /// Pricelist entry mode of the product.
        /// Note: possible values are below
        /// 1. null : Product doesn't participate in pricelist
        /// 2. Bulk : Bulk volume price available(unit price vary based on quantity)
        /// 3. Simple:   
        /// </summary>
        public string PriceListEntryMode { get; set; }

        /// <summary>
        /// Order Level Manual Adjustment applied to this Item
        /// </summary>
        public decimal? WeightedOrderAdjustment { get; set; }

        /// <summary>
        /// Order Level Discount applied to this Item
        /// </summary>
        public decimal? WeightedOrderDiscount { get; set; }

        /// <summary>
        /// Order Level taxable sub total
        /// </summary>
        public decimal? AdjustedLineItemSubtotal { get; set; }

        /// <summary>
        /// Taxable Subtotal including Weighted Order amounts
        /// </summary>
        public decimal? TotalWithoutWeightedShippingAndHandling { get; set; }

        /// <summary>
        /// Order Level tax applied to this Item
        /// </summary>
        public decimal? WeightedOrderTax { get; set; }

        /// <summary>
        /// Order Level Shipping applied to this Item
        /// </summary>
        public decimal? WeightedOrderShipping { get; set; }

        /// <summary>
        /// Order Level Shipping discount applied to this Item
        /// </summary>
        public decimal? WeightedOrderShippingDiscount { get; set; }

        /// <summary>
        /// Order Level Shipping Manual Adjustment applied to this Item
        /// </summary>
        public decimal? WeightedOrderShippingManualAdjustment { get; set; }

        /// <summary>
        /// Order Level Shipping Tax applied to this Item
        /// </summary>
        public decimal? WeightedOrderShippingTax { get; set; }


        public decimal? WeightedOrderHandlingFee { get; set; }

        public decimal? WeightedOrderHandlingFeeTax { get; set; }

        public decimal? WeightedOrderHandlingFeeDiscount { get; set; }

        public decimal? ShippingTaxTotal { get; set; }

        public decimal? ShippingTotal { get; set; }

        public decimal? WeightedOrderDuty { get; set; }

        /// <summary>
        /// Line item total with line item, Tax, Weighted Tax with Weighted shipping and handling costs
        /// </summary>
        public decimal? TotalWithWeightedShippingAndHandling { get; set; }

        public decimal? ItemTaxTotal { get; set; }

        public decimal? DiscountedTotal { get; set; }

        public decimal? ShippingAmountBeforeDiscountsAndAdjustments { get; set; }

        public decimal? WeightedOrderHandlingAdjustment { get; set; }

        public decimal? BasePrice
        {
            get
            {
                if (ProductUsage != "Bundle")
                {
                    return ListPrice - BundledProducts.Sum(p => (p.DeltaPrice ?? 0));
                }

                return ListPrice;
            }
        }

        public decimal? ManualPriceAdjustment
        {
            get
            {
                return ListPrice - UnitPrice;
            }
        }

        public decimal? AdjustmentTotal
        {
            get
            {
                return (WeightedOrderAdjustment ?? 0 ) +
                    (WeightedOrderDiscount != null ? -WeightedOrderDiscount.Value : 0) +
                    ((ActiveDiscounts != null) ? -ActiveDiscounts.Sum(x=>x.Total) : 0)
                    ;
            }
        }

        public decimal? ShippingAndHandlingTotal
        {
            get
            {
                return  (ShippingAmountBeforeDiscountsAndAdjustments ?? 0) +
                    (-WeightedOrderShippingDiscount ?? 0) +
                    (ActiveShippingDiscount != null ? -ActiveShippingDiscount.Total : 0) +
                    (ShippingTaxTotal.HasValue ? ShippingTaxTotal.Value : (WeightedOrderShippingTax ?? 0)) +
                    (WeightedOrderHandlingFee ?? 0) +
                    (HandlingAmount ?? 0) +
                    (WeightedOrderShippingManualAdjustment ?? 0) +
                    (WeightedOrderHandlingFeeTax ?? 0) +
                    (WeightedOrderHandlingFeeDiscount != null? -WeightedOrderHandlingFeeDiscount : 0)
                    ;
            }
        }

        public decimal? ShippingTotalWithDiscounts
        {
            get
            {
                return (ShippingAmountBeforeDiscountsAndAdjustments ?? 0) +
                    (-WeightedOrderShippingDiscount ?? 0) +
                    (ActiveShippingDiscount != null ? -ActiveShippingDiscount.Total : 0) +
                    (ShippingTaxTotal.HasValue ? ShippingTaxTotal.Value : (WeightedOrderShippingTax ?? 0)) +
                    (WeightedOrderShippingManualAdjustment ?? 0) +
                    (WeightedOrderShipping ?? 0)
                    ;
            }
        }

        public decimal? HandlingTotalWithDiscounts
        {
            get
            {
                return (WeightedOrderHandlingFee ?? 0) +
                    (HandlingAmount ?? 0) +
                    (WeightedOrderHandlingFeeTax ?? 0) +
                    (WeightedOrderHandlingFeeDiscount != null ? -WeightedOrderHandlingFeeDiscount : 0) +
                    (WeightedOrderHandlingAdjustment.HasValue ? WeightedOrderHandlingAdjustment.Value : 0)
                    ;
            }
        }

        public decimal? TaxAndDutyTotal
        {
            get
            {
                return (ItemTaxTotal ?? 0) +
                    (DutyAmount ?? 0);

            }
        }
    }
}
