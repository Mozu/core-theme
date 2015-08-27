using System.Collections.Generic;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Localization
{
    public class LocalizedAttributeValue
    {
        public string AttributeFQN { get; set; }

        public string AdminName { get; set; }
        
        public string AttributeName { get; set; }

        public string StringValue { get; set; }

        public string LocaleCode { get; set; }

        public List<string> SupportedLocales { get; set; } 

    }
}