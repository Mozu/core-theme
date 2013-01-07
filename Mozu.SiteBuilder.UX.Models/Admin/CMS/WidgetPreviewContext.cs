// -----------------------------------------------------------------------
// <copyright file="WidgetPreviewContext.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.Mvc.Models.CMS.Admin
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
using System.Runtime.Serialization;
    using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
    using Mozu.SiteBuilder.Mvc.Cms;

    
    [DataContract(Name = "widgetLocationContext")]
    public class WidgetPreviewContext
    {
        [DataMember (Name ="document")]
        public Document Document { get; set; }

        [DataMember(Name = "pageContext", EmitDefaultValue = false)]
        public PageContext PageContext { get; set; }

        [DataMember(Name = "definitionId")]
        public string DefinitionId { get; set; }
        
        [DataMember(Name = "zoneId")]
        public string  ZoneId { get; set; }

        [DataMember(Name = "zoneScope")]
        public string ZoneScope { get; set; }
        

        [DataMember(Name = "output")]
        public string Output { get; set; }
        

    }
    
}
