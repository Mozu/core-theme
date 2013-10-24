using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;

namespace Mozu.SiteBuilder.UX.Models.Admin.CMS
{
    [DataContract(Name = "cms")]
    public class CmsPageContext
    {
        public CmsPageContext()
        {
            this.SiteTemplate= new DocumentRequest()
                                      {
                                          Collection="templates",
                                          Path="site/default"
                                      };
            this.Page = new DocumentRequest();
            this.Template = new DocumentRequest();
        }
        [DataMember(Name = "page")]
        public DocumentRequest Page { get; set; }

        [DataMember(Name = "template")]
        public DocumentRequest Template { get; set; }

        [DataMember(Name = "site")]
        public DocumentRequest SiteTemplate { get; set; }

        
        [IgnoreDataMember()]
        public List<WidgetRuntimeData> RuntimeData { get; set; }


      



        [IgnoreDataMember()]
        public bool Initialized { get; set; }

   
    }
}
