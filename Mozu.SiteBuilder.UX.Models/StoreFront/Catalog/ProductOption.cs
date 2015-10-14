// -----------------------------------------------------------------------
// <copyright file="ProductOption.cs" company="Microsoft">
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
    /// 
    [DataContract()]
    public class ProductOption : BaseProductAttribute
    {

        [DataMember(EmitDefaultValue = false, IsRequired = true, Name = "isMultiValue")]
        public bool IsMultiValue { get; set; }
        [DataMember(EmitDefaultValue = false, IsRequired = true, Name = "isRequired")]
        public bool IsRequired { get; set; }
        [DataMember(EmitDefaultValue = false, IsRequired = true, Name = "isShopperEntered")]
        public bool IsShopperEntered { get; set; }
        [DataMember(EmitDefaultValue = false, IsRequired = true, Name = "optionType")]
        public string OptionType { get; set; }
        [DataMember(EmitDefaultValue = false, IsRequired = true, Name = "inputType")]
        public string StandardInputTypeIntention { get; set; }
        [DataMember(EmitDefaultValue = false, IsRequired = true, Name = "values")]
        public List<ProductOptionValue> Values { get; set; }
    }
}
