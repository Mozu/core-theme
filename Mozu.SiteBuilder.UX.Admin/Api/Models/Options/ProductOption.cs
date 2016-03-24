using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Options
{
    public class ProductOption
    {
        /// <summary>
        /// Unique identifier of the Attribute.
        /// 
        /// </summary>
        public string AttributeFQN { get; set; }

        /// <summary>
        /// List of all the values for this product option.
        /// 
        /// </summary>
        public List<ProductOptionValue> Values { get; set; }
    }
}
