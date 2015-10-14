
namespace Mozu.SiteBuilder.Mvc.Models.CMS
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
using System.Xml.Serialization;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public class TemplateDefaults
    {

        public List<WidgetDefaults> Widgets
        {
            get;
            set;
        }




        [XmlInclude(typeof(string[]))]
        [XmlInclude(typeof(int[]))]
        [XmlInclude(typeof(decimal[]))]
        [XmlInclude(typeof(double[]))]
        [XmlInclude(typeof(DateTime[]))]
        public class WidgetDefaults
        {
            public string DefinitionId { get; set; }
            public string Zone { get; set; }
            public List<KeyValuePair<string, object>> Properties { get; set; }
        }

        public enum InstallTypes
        {
            CurrentPage,
            CurrentPageType,
            AllPages
        };
           
    }
    
}
