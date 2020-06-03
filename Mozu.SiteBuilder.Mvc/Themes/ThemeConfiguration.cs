using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;
using Mozu.SiteBuilder.Mvc.Models.CMS;

namespace Mozu.SiteBuilder.Mvc.Themes
{
    /// <summary>
    /// Deserialization target for theme.json.
    /// </summary>
 
    public  class ThemeConfiguration
    {
        
        public ThemeAbout About { get; set; }

        
        public Dictionary<string,object> Settings { get; set; }

        
        public List<PageTypeDefinition> PageTypes { get; set; }

        
        public List<PageTypeDefinition> EmailTemplates { get; set; }

        
        public List<PageTypeDefinition> BackOfficeTemplates { get; set; }
        
        
        public List<WidgetDefinition> Widgets { get; set; }

       
        public List<LayoutWidgetDefinition> Layouts { get; set; }

       
        public List<EditorDefinition> Editors { get; set; }

   
        public class ThemeAbout
        {
          
            public string Name { get; set; }

           
            public string Author { get; set; }

        
            public string Extends { get; set; }

            
            public bool IsDesktop { get; set; }

            
            public bool IsMobile { get; set; }
            
            
            public bool IsTablet { get; set; }


            
            public string DefaultLanguage { get; set; }

            
            public bool? AllowProduction  { get; set; }
        }
    }
}
