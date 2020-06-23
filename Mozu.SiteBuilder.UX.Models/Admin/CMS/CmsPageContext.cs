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
                if (value == null||_page  == null)
                {
                    this._page = value;
                    this.Initialized = true;
                    return;
                }
                if (value.Document != null)
                {
                    _page = value;
                    this.Initialized = true;
                    return;
                }

                if (value.Id != _page.Id 
                    || value.Path != _page.Path 
                    || value.ListFQN != _page.ListFQN 
                    || value.DocumentTypeFQN != _page.DocumentTypeFQN)
                {
                    _page = value;
                    this.Initialized = false;
                    return;
                }
                


                this.Initialized = value?.Document != null;
            }
        }

        private DocumentRequest _template;
        
        public DocumentRequest Template
        {
            get { return _template; }
            set
            {
                if (value == null||_template  == null)
                {
                    this._template = value;
                    this.Initialized = true;
                    return;
                }
                if (value.Document != null)
                {
                    _template = value;
                    this.Initialized = true;
                    return;
                }

                if ( value.ListFQN == null)
                {
                    value.ListFQN = "pageTemplateContent@mozu";
                }
                
                if (value.Id != _template.Id 
                    || value.Path != _template.Path 
                    || value.ListFQN != _template.ListFQN 
                    || value.DocumentTypeFQN != _template.DocumentTypeFQN)
                {
                    
                    _template = value;
                    this.Initialized = false;
                    return;
                }
                


                this.Initialized = value?.Document != null;
                
                
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
                if (value == null||_siteTemplate  == null)
                {
                    this._siteTemplate = value;
                    this.Initialized = true;
                    return;
                }
                if (value.Document != null)
                {
                    _siteTemplate = value;
                    this.Initialized = true;
                    return;
                }

                if ( value.ListFQN == null)
                {
                    value.ListFQN = "pageTemplateContent@mozu";
                }
                
                if (value.Id != _siteTemplate.Id 
                    || value.Path != _siteTemplate.Path 
                    || value.ListFQN != _siteTemplate.ListFQN 
                    || value.DocumentTypeFQN != _siteTemplate.DocumentTypeFQN)
                {
                    
                    _siteTemplate = value;
                    this.Initialized = false;
                    return;
                }
                


                this.Initialized = value?.Document != null;
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
