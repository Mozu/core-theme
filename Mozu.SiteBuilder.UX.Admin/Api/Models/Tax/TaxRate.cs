using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Tax
{
     
    
    public class TaxRate
    {
        
        public string id
        {
            get{
                return this.StateCode ;
            }
            set{}

        }
        
        
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string CountryCode 
        { 
            get
            {
                return "us";
            }
            set
            {

            }
        }
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string StateCode { get; set; }
       
    }
}
