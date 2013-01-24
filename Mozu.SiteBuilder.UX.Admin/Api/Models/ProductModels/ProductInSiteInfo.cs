using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{
    /// <summary>
    /// Represents the site-specific overrides configurable for a product.
    /// </summary>
    [DataContract]
    public class ProductInSiteInfo
    {
        /// <summary>
        /// The site identifier these overrides belong to.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "siteId")]
        public int SiteId { get; set; }

        /// <summary>
        /// Represents whether the product is active in this site.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "isActive")]
        public bool IsActive { get; set; }

        #region Price
        /// <summary>
        /// Represents whether the price information is overridden from the global data.
        /// </summary>
        public bool isPriceOverride { get; set; }
        #endregion

        #region Content
        /// <summary>
        /// Represents whether the content information is overridden from the global data.
        /// </summary>
        public bool isContentOverride { get; set; }
        #endregion

    }
}