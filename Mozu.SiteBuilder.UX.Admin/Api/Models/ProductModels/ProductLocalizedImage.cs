using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{
    [DataContract]
    public class ProductLocalizedImage
    {
        [DataMember(EmitDefaultValue = false, Name = "productCode")]
        public string ProductCode { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "alt")]
        public string AltText { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "imagePath")]
        public string ImagePath { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "isoCultureCode")]
        public string ISOCultureCode { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "videoUrl")]
        public string VideoUrl { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "sequence")]
        public int? Sequence { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "id")]
        public int? ImageId { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "url")]
        public string ImageUrl { get; set; }
    }
}