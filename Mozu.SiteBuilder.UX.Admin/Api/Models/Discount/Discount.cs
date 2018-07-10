using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Discount
{

    public class Discount
    {
       
        public int? Id { get; set; }

        // Flattened

        public string Name { get; set; }

        public string FriendlyDescription { get; set; }

        /// <summary>
        /// : Order, LineItem
        /// </summary>

        public bool DoesNotApplyToSalePrice { get; set; }

        public bool DoesNotApplyToProductsWithSalePrice { get; set; }


        public string Scope { get; set; }

        //The field previously known as TargetType
        /// <summary>
        /// Target
        /// Valid values are Shipping, Product
        /// </summary>
        public string Target { get; set; }


     
        public bool? IncludeAllProducts { get; set; }

        /// <summary>
        /// prevents application of order level discounts when an line item has a product line item discount applied
        /// </summary>
        public bool? ExcludeItemsWithExistingProductDiscounts { get; set; }
        
        /// <summary>
        /// prevents application of order level discounts when an line item has a shipping line item discount applied
        /// </summary>
        public bool? ExcludeItemsWithExistingShippingDiscounts { get; set; }


        /// <summary>
        /// Maximum impact this discount can apply to an order.
        /// </summary>
        [JsonProperty(PropertyName = "maximumDiscountValuePerOrder")]
        public decimal? MaximumDiscountImpactPerOrder { get; set; }

        /// <summary>
        /// Maximum impact this discount can apply on a single line item.
        /// </summary>
        [JsonProperty(PropertyName = "maximumDiscountValuePerRedemption")]
        public decimal? MaximumDiscountImpactPerRedemption { get; set; }

        /// <summary>
        /// List of categories this discount applies to.
        /// </summary>
     
        public List<int> ExcludedCategories { get; set; }

        /// <summary>
        /// List of products this discount applies to.
        /// </summary>
      
        public List<string> ExcludedProducts { get; set; }


        public int? MaximumQuantityPerRedemption { get; set; }

        
        public int? MaximumRedemptionsPerOrder { get; set; }
        
        /// <summary>
        /// List of categories this discount applies to.
        /// </summary>
        [JsonProperty(PropertyName = "conditionalCategories")]
        public List<int> DiscountConditionCategories { get; set; }

        /// <summary>
        /// List of products this discount requires to.
        /// </summary>
        [JsonProperty(PropertyName = "conditionalProducts")]
        public List<string> DiscountConditionProducts { get; set; }

        /// <summary>
        /// Categories operator, All or Any.  Defaults to Any
        /// </summary>
        public bool IsIncludedCategoriesAllOperator { get; set; }

        /// <summary>
        /// List of categories this order cant have .
        /// </summary>
        [JsonProperty(PropertyName = "conditionalExcludedCategories")]
        public List<int> DiscountConditionExcludedCategories { get; set; }

        /// <summary>
        /// List of products this discount requires to.
        /// </summary>
        [JsonProperty(PropertyName = "conditionalExcludedProducts")]
        public List<string> DiscountConditionExcludedProducts { get; set; }

        public List<int> CustomerSegments { get; set; }


        /// <summary>
        /// List of categories this discount applies to.
        /// </summary>

        public List<int> Categories { get; set; }

        /// <summary>
        /// List of products this discount applies to.
        /// </summary>
  
        public List<string> Products { get; set; }

        /// <summary>
        /// List of payment types that are a condition of this discount.
        /// </summary>
        [JsonProperty(PropertyName = "includedPaymentMethod")]
        public string IncludedPaymentType { get; set; } 

        /// <summary>
        /// List of shipping methods this discount applies to.
        /// </summary>

        public List<string> ShippingMethods { get; set; }


        public List<string> ShippingZones { get; set; }

   
        public decimal? MinimumOrderAmount { get; set; }

      
        public decimal? MinimumLifetimeValueAmount { get; set; }

      
        public int? MaxRedemptionCount { get; set; }

        
        public int? CurrentRedemptionCount { get; set; }

        public int? MaximumUsesPerUser { get; set; }

        public bool? DoesNotApplyToMultiShipToOrders { get; set; }

        public bool RequiresCoupon { get; set; }

        public string CouponCode { get; set; }

   
        public decimal? Amount { get; set; }

        /// <summary>
        /// Amount type.
        /// Valid values are Percentage, Amount, Free
        /// </summary>
 
        public string AmountType { get; set; }

        
        public DateTime? StartDate { get; set; }

        public DateTime? ExpirationDate { get; set; }

        /// <summary>
        /// Status. Set by the service.
        /// Values are "Ended", "Scheduled", or "Active".
        /// </summary>
        public string Status { get; set; }

        public bool CanBeDeleted { get; set; }

        public int? MinimumQuantityProductsRequiredInCategories { get; set; }

        public int? MinimumQuantityRequiredProducts { get; set; }

        public decimal? MinimumCategorySubtotalBeforeDiscounts { get; set; }

        public List<CouponSet> CouponSets { get; set; }

        public bool? AppliesToLeastExpensiveProductsFirst { get; set; }

        public List<string> IncludedPriceLists { get; set; }

        /// <summary>
        /// Indicates whether or not stacking is enabled for this discount
        /// </summary>
        public bool? CanBeStackedUpon { get; set; }

        /// <summary>
        /// Indicates which stacking layer this discount is a part of
        /// </summary>
        public int? StackingLayer { get; set; }

        public DateTime? CreateDate { get; set; }

        public string CreateBy { get; set; }

        public DateTime? LastModifiedDate { get; set; }

        public string LastModifiedBy { get; set; }

        /// <summary>
        /// Container for a discounts threshold message
        /// </summary>
        public ThresholdMessage ThresholdMessage { get; set; }

        public List<string> ProductsToExcludeFromMinOrderTotal { get; set; }

        public List<int> CategoriesToExcludeFromMinOrderTotal { get; set; }

        /// <summary>
        /// Prevents Line Item Shipping discounts from being applied when a Line Item Product  
        /// discount has been applied 
        /// </summary>
        public bool? PreventLineItemShippingDiscounts { get; set; }

        /// <summary>
        /// Prevents Order Product discounts from being applied when a Line Item Product  
        /// or Shipping discount has been applied 
        /// </summary>
        public bool? PreventOrderProductDiscounts { get; set; }

        /// <summary>
        /// Prevents Order Shipping discounts from being applied when a Line Item Product/Shipping  
        /// or Order Product discount has been applied 
        /// </summary>
        public bool? PreventOrderShippingDiscounts { get; set; }

        /// <summary>
        /// Defines a minimum quantity that is required for a target only discount
        /// </summary>
        public int? MinimumRequiredQuantityPerRedemption { get; set; }

        /// <summary>
        /// Indicates if this discount has purchase conditions that must be met before 
        /// the discount is applied
        /// </summary>
        public bool HasPurchaseConditions { get; set; }

        /// <summary>
        /// The type of purchase requirement for this discount, either purchase conditions and targets which   
        /// Supports BoGo, and BxGx scenarios. Or Target only that only have a target and no purchase conditions
        /// </summary>
        public string PurchaseRequirementType { get; set; }
    }
}