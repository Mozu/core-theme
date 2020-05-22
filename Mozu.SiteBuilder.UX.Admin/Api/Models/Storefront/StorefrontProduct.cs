using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Mozu.ProductRuntime.Contracts;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Storefront
{
    [JsonObject]
    public class StorefrontProduct : ProductRuntime.Contracts.Product
    {
        //public virtual string ProductCode { get; set; }

        /// <summary>
        /// The UsageType of this product (Standard, Configurable, Bundle, Component)
        /// 
        /// </summary>
        //public string ProductUsage { get; set; }

        /// <summary>
        /// The GoodsType of the product (Physical, Digital, DigitalCredit....)
        /// 
        /// </summary>
        //public virtual string GoodsType { get; set; }

        /// <summary>
        /// Name of the product 
        /// 
        /// </summary>
        public virtual string Name => Content != null ? Content.ProductName : string.Empty;

        /// <summary>
        /// Represents the published state of the product returned. Valid values for ValueType are defined in PublishStateConst.
        /// 
        /// </summary>
        //public virtual string PublishState { get; set; }

        /// <summary>
        /// Price of the product with sale and discounts applied.
        /// 
        /// </summary>
        //public new virtual decimal? Price => 
        //    base.Price != null 
        //        ? base.Price.CatalogListPrice 
        //        : (base.PriceRange != null ? base.PriceRange.Lower?.Price : null);

        public new decimal? Price { get; set; }

        public new decimal? SalePrice =>
            base.Price != null 
                ? base.Price.SalePrice
                : (base.PriceRange != null ? base.PriceRange.Lower?.SalePrice : null);

        public string ImageUrl => base.Content?.ProductImages?.FirstOrDefault()?.ImageUrl;

        //public virtual string ProductType { get; set; }

        //public virtual int? ProductTypeId { get; set; }

        /// <summary>
        /// If true, the product is subject to tax.
        /// 
        /// </summary>
        //public virtual bool IsTaxable { get; set; }

        /// <summary>
        /// If true, the product can be purchased or fulfilled at regular intervals, for example, monthly billing or a subscription.
        /// 
        /// </summary>
        //public virtual bool IsRecurring { get; set; }

        /// <summary>
        /// When the product was created with the product admin resource.
        /// 
        /// </summary>
        //public virtual DateTime CreateDate { get; set; }

        //public virtual DateTime? DateFirstAvailableInCatalog { get; set; }

        //public virtual DateTime? CatalogStartDate { get; set; }

        //public virtual DateTime? CatalogEndDate { get; set; }

        //public virtual int? DaysAvailableInCatalog { get; set; }

        /// <summary>
        /// When a configurable product has IsPurchasable=true on a GetProduct, this property will be populated for submission to cart.
        /// 
        /// </summary>
        //public string VariationProductCode { get; set; }

    }
}