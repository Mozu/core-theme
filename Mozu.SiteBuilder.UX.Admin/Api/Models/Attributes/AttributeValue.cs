using System;
using System.Runtime.Serialization;
using System.Text.RegularExpressions;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes
{
    [DataContract]
    public class AttributeValue
    {
     

        [DataMember(Name = "id")]
        public object  Id{ get; set; }
       

        [DataMember(Name = "attributeFQN")]
        public string AttributeFQN { get; set; }

        [DataMember(Name = "value")]
        public object Value { get; set; }
    }
}