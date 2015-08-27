using System;
using System.Collections.Generic;
using System.Runtime.InteropServices.ComTypes;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Localization
{
    
    public class LocalizedProductExtraPrice
    {
        //PK
        public string ProductCode { get; set; }

        public string AttributeFQN { get; set; }

        public string ProductName { get; set; }
        
        public string AdminName { get; set; }

        public string AttributeName { get; set; }


        //global price

        public string CurrencyCode { get; set; }
        
        public decimal? DeltaPrice { get; set; }


        public List<string> SupportedCurrencies { get; set; } 

    }

}
