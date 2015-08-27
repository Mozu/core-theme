using System;
using System.Collections.Generic;
using System.Runtime.InteropServices.ComTypes;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Localization
{
    
    public class LocalizedProductVariantPrice
    {
        //PK
        public string VariantProductCode { get; set; }

        public string VariationKey { get; set; }

        public string ParentProductCode { get; set; }

        public string ProductName { get; set; }

        //array -> string - render template.
        public List<string> Options { get; set; }


        //global price

        public string CurrencyCode { get; set; }
        
        public decimal? DeltaPrice { get; set; }

        public decimal? DeltaCreditValue { get; set; }

        public decimal? DeltaMSRP { get; set; }

        public List<string> SupportedCurrencies { get; set; } 

    }

}
