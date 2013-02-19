using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes
{
    [DataContract]
    public class ProductType
    {
        [DataMember(Name = "id")]
        public int? Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "isBase")]
        public bool IsBase { get; set; }

        [DataMember(Name = "numberOfProducts")]
        public int? NumberOfProducts { get; set; }

        [DataMember(Name = "options")]
        public List<ProductTypeAttribute> Options { get; set; }

        [DataMember(Name = "extras")]
        public List<ProductTypeAttribute> Extras { get; set; }

        [DataMember(Name = "properties")]
        public List<ProductTypeAttribute> Properties { get; set; }

        [DataMember(Name = "modifiedDate")]
        public DateTime? ModifiedDate { get; set; }

    }
}