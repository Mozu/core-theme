using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;
using System.Xml.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{
    [DataContract]
    public class StockOnHandAdjustment
    {
        [DataMember(EmitDefaultValue = false, Name = "type")]
        public string Type { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "value")]
        public int Value { get; set; }
    }

    [DataContract]
    public class UnitOfMeasure
    {
        [DataMember(EmitDefaultValue = false, Name = "symbol")]
        public string Symbol { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "val")]
        public decimal? Val { get; set; }
    }

    [DataContract]
    public class Discount
    {
        [DataMember(EmitDefaultValue = false, Name ="id")]
        public int? DiscountId { get; set; }   
    }
}