// -----------------------------------------------------------------------
// <copyright file="ProductPurchasableState.cs" company="Microsoft">
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
    public class ProductPurchasableState
    {


        [DataMember(Name = "isPurchasable")]
        public bool IsPurchasable { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "messages")]
        public List<ValidationMessage> Messages { get; set; }
    }
    [DataContract]
   public class ValidationMessage
   {
      

       [DataMember(EmitDefaultValue = false, Name="message")]
       public string Message { get; set; }
       [DataMember(EmitDefaultValue = false, Name = "severity")]
       public string Severity { get; set; }
       [DataMember(EmitDefaultValue = false, Name = "source")]
       public string Source { get; set; }
       [DataMember(EmitDefaultValue = false, Name = "sourceId")]
       public string SourceId { get; set; }
   }
}
