// -----------------------------------------------------------------------
// <copyright file="WidgetPreviewContext.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Web.Mvc;
using Mozu.SiteBuilder.UX.Models.ModelMetaData;

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
        [DataMember(Name = "configuration")]
        public string ConfigurationData { get; set; }

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


         [DataMember(Name = "index")]
        public int? Index { get; set; }
    }

    public class WidgetRuntimeData : WidgetInstanceData ,IModelMetadataParentContainer, IModelMetadataContainer 
    {

        public WidgetDefinition Definition { get; set; }

        public System.Web.Mvc.ModelMetadata GetModelMetadata()
        {
            return null;
            //var mmd  = GetModelMetadata("___");
            //return mmd;
        }

        public System.Web.Mvc.ModelMetadata GetModelMetadata(string property)
        {
            return null;
            //var mmd = new ModelMetadata(ModelMetadataProviders.Current, this.GetType(), () => this[property], typeof(string), property);
            //return mmd;
        }

        public bool IsPreview { get; set; }
    }

    public class WidgetInstanceData 
    {
        [DataMember(Name = "definitionId")]
        public string DefinitionId { get; set; }

        [DataMember(Name = "zoneId")]
        public string ZoneId { get; set; }

        [DataMember(Name = "index")]
        public int? Index { get; set; }

        [DataMember(Name = "configuration")]
        public string ConfigurationData { get; set; }

        [DataMember(Name = "zoneScope")]
        public string ZoneScope { get; set; }

        
    }
    
}
