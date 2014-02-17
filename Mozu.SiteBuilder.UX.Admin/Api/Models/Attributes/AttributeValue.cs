using System;
using Newtonsoft.Json;
using System.Text.RegularExpressions;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes
{
    
    public class AttributeValue
    {
     

        public object  Id{ get; set; }
       

        public string AttributeFQN { get; set; }

        public object Value { get; set; }
    }
}
