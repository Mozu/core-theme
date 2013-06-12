using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Tax
{
     [DataContract]
    
    public class TaxRate
    {
        [DataMember()]
        public string id
        {
            get{
                return this.StateCode ;
            }
            set{}

        }
        
        
        [DataMember(EmitDefaultValue = false, Name = "countryCode")]
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
       [DataMember(EmitDefaultValue = false, Name="stateCode")]
        public string StateCode { get; set; }
       
    }
}
