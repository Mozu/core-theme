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
                                          ListFQN = "pageTemplateContent@mozu",
                                          Path="site/page"
                                      };
            this.Page = new DocumentRequest();
            this.Template = new DocumentRequest();
        }

        private DocumentRequest _page;
        [DataMember(Name = "page")]
        public DocumentRequest Page 
        {
            get { return _page; }
            set
            {
                _page = value;
                this.Initialized = false;
            }
        }

        private DocumentRequest _template;
        [DataMember(Name = "template")]
        public DocumentRequest Template
        {
            get { return _template; }
            set
            {
                _template = value;
                if (value != null && value.ListFQN == null)
                {
                    value.ListFQN = "pageTemplateContent@mozu";
                }
                this.Initialized = false;
            }
        }
        private DocumentRequest _siteTemplate;
        [DataMember(Name = "site")]
        public DocumentRequest SiteTemplate
        {
            get { return _siteTemplate; }
            set
            {
                _siteTemplate = value;
                if (value != null && value.ListFQN == null)
                {
                    value.ListFQN = "pageTemplateContent@mozu";
                }
                this.Initialized = false;
            }
        }

        
        //[IgnoreDataMember()]
        //public List<WidgetRuntimeData> RuntimeData { get; set; }

        [IgnoreDataMember()]
        public List<ZoneRuntimeData> RuntimeData { get; set; }


      



        [IgnoreDataMember()]
        public bool Initialized { get; set; }

   
    }
}
