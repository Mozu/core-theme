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


        //MaximumDiscountImpactPerOrder
        public decimal? MaximumDiscountImpactPerOrder { get; set; }


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
        /// List of shipping methods this discount applies to.
        /// </summary>
      
        public List<string> ShippingMethods { get; set; }


        public List<string> ShippingZones { get; set; }


   
        public Decimal? MinimumOrderAmount { get; set; }


      
        public Decimal? MinimumLifetimeValueAmount { get; set; }


        public Decimal? MaximumDiscountValuePerOrder { get; set; }

      
        public int? MaxRedemptionCount { get; set; }

        
        public int? CurrentRedemptionCount { get; set; }

        public int? MaximumUsesPerUser { get; set; }

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



        public int? MinimumQuantityProductsRequiredInCategories { get; set; }
        public int? MinimumQuantityRequiredProducts { get; set; }
        public decimal? MinimumCategorySubtotalBeforeDiscounts { get; set; }
    }
}