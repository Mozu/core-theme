using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{
    
    public class ProductCodeRename
    {
        public string ExistingProductCode { get; set; }

        public string NewProductCode { get; set; }
    }

}