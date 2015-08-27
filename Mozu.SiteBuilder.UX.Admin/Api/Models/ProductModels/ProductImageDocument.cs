using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{
    
    public class ProductImageDocument
    {
        public string Id { get; set; }

        public string FileName { get; set; }

        public string AltText { get; set; }

        public string Caption { get; set; }

        public int? ProductId { get; set; }
    }
}
