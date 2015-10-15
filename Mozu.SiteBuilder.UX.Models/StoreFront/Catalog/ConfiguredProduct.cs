// -----------------------------------------------------------------------
// <copyright file="ConfiguredProduct.cs" company="Microsoft">
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

   
    [DataContract()]
    public class ConfiguredProduct
    {
       
     

        [DataMember(EmitDefaultValue = false, Name = "options")]
        public List<ProductOption> Options { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "price")]
        public ProductPrice Price { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "priceRange")]
        public ProductPrice PriceRange { get; set; }

        [DataMember(Name = "productCode")]
        public string ProductCode { get; set; }

        [DataMember(Name = "purchasableState")]
        public ProductPurchasableState PurchasableState { get; set; }
        
        //[DataMember(EmitDefaultValue = false)]
        //public ProductStock Stock { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "variationProductCode")]
        public string VariationProductCode { get; set; }

     //   //[DataMember(EmitDefaultValue = false)]
     //  // public List<Discount> AvailableShippingDiscounts { get; set; }
     //   [DataMember(EmitDefaultValue = false, Name="configurationOptions")]
     //   public List<ProductConfigurationOption> ConfigurationOptions { get; set; }


     //   [DataMember(Name = "productCode")]
     //   public string ProductCode { get; set; }
     //   //[DataMember]
     //   //public ProductPurchasableState PurchasableState { get; set; }
     //   [DataMember(EmitDefaultValue = false, Name="standaloneOptions")]
     //   public List<ProductStandaloneOption> StandaloneOptions { get; set; }
     ////   [DataMember(EmitDefaultValue = false)]
     ////   public ProductStock Stock { get; set; }
     //   [DataMember(EmitDefaultValue = false, Name="variationCode")]
     //   public string VariationProductCode { get; set; }
     //  [DataMember(EmitDefaultValue = false, Name = "purchasableMessage")]
     //   public string PurchasableMessage { get; set; }

     //   [DataMember(EmitDefaultValue = false, Name = "price")]
     //  public ProductPrice Price { get; set; }
       
    }
}
