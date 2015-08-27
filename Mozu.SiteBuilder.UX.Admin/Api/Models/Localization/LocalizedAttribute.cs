using System;
using System.Collections.Generic;
using System.Runtime.InteropServices.ComTypes;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Localization
{
    
    public class LocalizedAttribute
    {
        public string AttributeFQN { get; set; }

        public string AdminName { get; set; }

        public string Name { get; set; }
        public string Description { get; set; }
        public string LocaleCode { get; set; }

        public List<string> SupportedLocales { get; set; } 

    }

}
