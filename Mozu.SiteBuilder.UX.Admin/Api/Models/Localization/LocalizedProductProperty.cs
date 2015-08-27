using System;
using System.Collections.Generic;
using System.Runtime.InteropServices.ComTypes;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Localization
{
    
    public class LocalizedProductProperty
    {
        //PK
        public string ProductCode { get; set; }

        public string ProductName { get; set; }

        public string AttributeFQN { get; set; }
        
        public string AdminName { get; set; }

        public string CanonicalValue { get; set; }

        //global 

        public string LocaleCode { get; set; }
        
        public string StringValue { get; set; }

        public List<string> SupportedLocales { get; set; } 

    }

}
