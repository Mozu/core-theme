using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;

namespace Mozu.SiteBuilder.UX.Models.Admin.CMS
{
    
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
        [Newtonsoft.Json.JsonProperty( "site")]
        [System.Text.Json.Serialization.JsonPropertyName("site")]
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
        [Newtonsoft.Json.JsonIgnore]
        [System.Text.Json.Serialization.JsonIgnore]
        public List<Chorizo.ZoneRuntimeData> RuntimeData { get; set; }


        [IgnoreDataMember()]
        [System.Text.Json.Serialization.JsonIgnore]
        [Newtonsoft.Json.JsonIgnore]
        public List<Caliente.ZoneRuntimeData> CalienteRuntimeData { get; set; }

        public static class LayoutTypeConstants
        {
            public static string Caliente = "CALIENTE";
            public static string Chorizo = "CHORIZO";
        }

        [IgnoreDataMember()]
        [System.Text.Json.Serialization.JsonIgnore]
        public bool Initialized { get; set; }

       
    }
}
