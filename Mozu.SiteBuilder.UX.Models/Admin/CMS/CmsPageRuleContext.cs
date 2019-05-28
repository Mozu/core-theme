using System;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.UX.Models.Admin.CMS
{
    public class CmsPageRuleContext
    {
        public CmsPageRuleContext()
        {
            Customer = new CustomerModel();
        }
        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public CustomerModel Customer { get; set; }
        
        //public string PriceListCode { get; set; }

        //public string AffliateCode { get; set; }

        //Maybe support for dymanic properties in the context?
        //public object CustomerAttributeValue { get; set; }
    }

    public class CustomerModel
    {
        public List<string> CustomerSegments { get; set; }
    }

}
