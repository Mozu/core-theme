using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Discount
{
  
    public class Discount
    {
       
        public int? Id { get; set; }

        // Flattened

        public string Name { get; set; }

        /// <summary>
        /// : Order, LineItem
        /// </summary>
      
        public string Scope { get; set; }


        /// <summary>
        /// Target type.
        /// Valid values are Shipping, Product
        /// </summary>
        [DataMember(Name = "target")]
        public string TargetType { get; set; }


     
        public bool? IncludeAllProducts { get; set; }



        /// <summary>
        /// List of categories this discount applies to.
        /// </summary>
     
        public List<int> ExcludedCategories { get; set; }

        /// <summary>
        /// List of products this discount applies to.
        /// </summary>
      
        public List<string> ExcludedProducts { get; set; }


        

        

             /// <summary>
        /// List of categories this discount applies to.
        /// </summary>
        [DataMember(Name = "conditionalCategories")]
        public List<int> DiscountConditionCategories { get; set; }

        /// <summary>
        /// List of products this discount requires to.
        /// </summary>
        [DataMember(Name = "conditionalProducts")]
        public List<string> DiscountConditionProducts { get; set; }

        /// <summary>
        /// List of categories this order cant have .
        /// </summary>
        [DataMember(Name = "conditionalExcludedCategories")]
        public List<int> DiscountConditionExcludedCategories { get; set; }

        /// <summary>
        /// List of products this discount requires to.
        /// </summary>
        [DataMember(Name = "conditionalExcludedProducts")]
        public List<string> DiscountConditionExcludedProducts { get; set; }






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


   
        public Decimal? MinimumOrderAmount { get; set; }


      
        public Decimal? MinimumLifetimeValueAmount { get; set; }

        


      
        public int? MaxRedemptionCount { get; set; }

        
        public int? CurrentRedemptionCount { get; set; }

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

      
    }
}