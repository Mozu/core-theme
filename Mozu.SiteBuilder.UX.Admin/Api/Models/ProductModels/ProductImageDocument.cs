using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{
    [DataContract]
    public class ProductImageDocument
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "fileName")]
        public string FileName { get; set; }

        [DataMember(Name = "altText")]
        public string AltText { get; set; }

        [DataMember(Name = "caption")]
        public string Caption { get; set; }

        [DataMember(Name = "productId")]
        public int? ProductId { get; set; }
    }
}