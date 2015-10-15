// -----------------------------------------------------------------------
// <copyright file="Price.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.UX.Models.StoreFront.Catalog
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Runtime.Serialization;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    [DataContract ()]
    public class ProductPrice : ModelBase
    {
        [DataMember(EmitDefaultValue = false, Name="price")]
        public decimal? Price { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "salePrice")]
        public decimal? SalePrice { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "discountId")]
        public int? DiscountId { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "discountName")]
        public string DiscountName { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "discountEndDate")]
        public DateTime? DiscountEndDate { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "lowerBoundPrice")]
        public decimal? LowerBoundPrice { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "lowerBoundSalePrice")]
        public decimal? LowerBoundSalePrice { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "upperBoundPrice")]
        public decimal? UpperBoundPrice { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "hasRange")]
        public bool HasRange
        {
            get
            {
                return this.LowerBoundPrice.GetValueOrDefault(-1) > 0 || this.LowerBoundSalePrice.GetValueOrDefault(-1) > 0 || this.UpperBoundPrice.GetValueOrDefault(-1) > 0;
            }
        }
        [DataMember(EmitDefaultValue = false, Name = "hasSalePrice")]
        public bool HasSalePrice
        {
            get
            {
                return this.LowerBoundSalePrice.GetValueOrDefault(-1) > 0 || this.SalePrice.GetValueOrDefault(-1) > 0;
            }
        }

        [DataMember(EmitDefaultValue = false, Name = "hasDiscount")]
        public bool HasDiscount
        {
            get
            {
                return this.DiscountId.GetValueOrDefault(-1) > 0;
            }
        }


        [DataMember(EmitDefaultValue = false, Name = "offerPrice")]
        public decimal? OfferPrice
        {
            get
            {
                if (this.HasRange)
                {
                    if (this.HasSalePrice)
                    {
                        return this.LowerBoundSalePrice;
                    }
                    else
                    {
                        return this.LowerBoundPrice;
                    }
                }
                else
                {
                    if (this.HasSalePrice)
                    {
                        return this.SalePrice;
                    }
                    else
                    {
                        return this.Price;
                    }
                }
            }
        }
    }
}
