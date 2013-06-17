using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Discount
{
    [DataContract]
    public class Discount
    {
        [DataMember(Name = "id")]
        public int? Id { get; set; }

        // Flattened
        [DataMember(Name = "name")]
        public string Name { get; set; }

        /// <summary>
        /// : Order, LineItem
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "scope")]
        public string Scope { get; set; }


        /// <summary>
        /// Target type.
        /// Valid values are Shipping, Product
        /// </summary>
        [DataMember(Name = "target")]
        public string TargetType { get; set; }


        [DataMember(EmitDefaultValue = false, Name = "includeAllProducts")]
        public bool? IncludeAllProducts { get; set; } 
        

      



        

        /// <summary>
        /// List of categories this discount applies to.
        /// </summary>
        [DataMember(Name = "categories")]
        public List<int> Categories { get; set; }

        /// <summary>
        /// List of products this discount applies to.
        /// </summary>
        [DataMember(Name = "products")]
        public List<string> Products { get; set; }

        /// <summary>
        /// List of shipping methods this discount applies to.
        /// </summary>
        [DataMember(Name = "shippingMethods")]
        public List<string> ShippingMethods { get; set; }


        [DataMember(EmitDefaultValue = false,Name = "minimumOrderAmount")]
        public Decimal? MinimumOrderAmount { get; set; }


        [DataMember(Name = "maxRedemptionCount")]
        public int? MaxRedemptionCount { get; set; }

        [DataMember(Name = "currentRedemptionCount")]
        public int? CurrentRedemptionCount { get; set; }

        [DataMember(Name = "requiresCoupon")]
        public bool RequiresCoupon { get; set; }

        [DataMember(Name = "couponCode")]
        public string CouponCode { get; set; }

        [DataMember(Name = "amount")]
        public decimal? Amount { get; set; }

        /// <summary>
        /// Amount type.
        /// Valid values are Percentage, Amount, Free
        /// </summary>
        [DataMember(Name = "amountType")]
        public string AmountType { get; set; }

        [DataMember(Name = "startDate")]
        public DateTime? StartDate { get; set; }

        [DataMember(Name = "expirationDate")]
        public DateTime? ExpirationDate { get; set; }

        /// <summary>
        /// Status. Set by the service.
        /// Values are "Ended", "Scheduled", or "Active".
        /// </summary>
        [DataMember(Name = "status")]
        public string Status { get; set; }

      
    }
}