// -----------------------------------------------------------------------
// <copyright file="ProductOptionSelection.cs" company="Microsoft">
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
    [DataContract]
    public class ProductOptionSelection
    {
        [DataMember(EmitDefaultValue = false, IsRequired = true, Name = "id")]
        public int Id { get; set; }

        //optional
        [DataMember(EmitDefaultValue = false, Name = "value")]
        public string ShopperEnteredValue { get; set; }

        
        public string value
        {
            get { return this.ShopperEnteredValue; }
            set { this.ShopperEnteredValue = value; }
        }
    }

    [DataContract]
    public class ProductConfigurationRequest
    {
        [DataMember(EmitDefaultValue = false, Name="productCode")]
        public string ProductCode
        { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "quantity")]
        public int Quantity
        { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "variationProductCode")]
        public string variationProductCode
        { get; set; }

        [DataMember(EmitDefaultValue = false, Name="options")]
        public List<ProductOptionSelection> Options
        { get; set; }
    }
}
