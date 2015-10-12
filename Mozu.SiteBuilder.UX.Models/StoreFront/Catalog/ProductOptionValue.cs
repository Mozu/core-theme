// -----------------------------------------------------------------------
// <copyright file="ProductOptionValue.cs" company="Microsoft">
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
    public class ProductOptionValue : BaseProductAttributeValue
    {
     

        [DataMember(EmitDefaultValue = false, Name = "deltaPrice")]
        public decimal? DeltaPrice { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "deltaWeight")]
        public decimal? DeltaWeight { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "enabled")]
        public bool Enabled
        {
            get { return this.IsEnabled; }
            set {}
        }
        
        
        [DataMember(EmitDefaultValue = false, Name = "isEnabled")]
        public bool IsEnabled { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "isDefault")]
        public bool? IsDefault { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "isSelected")]
        public bool IsSelected { get; set; }
    }
}
