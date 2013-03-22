using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{
    [DataContract]
    public class ProductProperty
    {
        [DataMember(EmitDefaultValue = false, Name = "attributeFQN")]
        public string AttributeFQN { get; set; }


        [DataMember(EmitDefaultValue = false, Name = "values")]
        public List<ProductPropertyValue> Values { get; set; }
    }
    [DataContract]
   
    public class ProductPropertyValue
    {
        [DataMember(EmitDefaultValue = false, Name = "value")]
        public object Value { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "localizedValue")]
        public string LocalizedValue { get; set; }

        
    }
}