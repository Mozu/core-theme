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
            this.SiteTemplateReq= new DocumentRequest()
                                      {
                                          Collection="templates",
                                          Path="site/default"
                                      };
        }
        [DataMember(Name = "pageDoc")]
        public DocumentRequest PageReq { get; set; }

        [DataMember(Name = "templateDoc")]
        public DocumentRequest TemplateReq { get; set; }

        [DataMember(Name = "siteDoc")]
        public DocumentRequest SiteTemplateReq { get; set; }

        
        [IgnoreDataMember()]
        public List<WidgetRuntimeData> RuntimeData { get; set; }


      



        [IgnoreDataMember()]
        public bool Initialized { get; set; }

        [IgnoreDataMember()]
        public Mozu.Content.Contracts.Document Page { get; set; }

        [IgnoreDataMember()]
        public Mozu.Content.Contracts.Document Template { get; set; }

        [IgnoreDataMember()]
        public Mozu.Content.Contracts.Document SiteTemplate { get; set; }
    }
}
