// -----------------------------------------------------------------------
// <copyright file="WidgetInstance.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.Mvc.Models.CMS
{
    using System;
    using System.Runtime.Serialization;
    
    using System.Web.Mvc;
using Mozu.Content.Contracts;

    
    using Newtonsoft.Json.Linq;
    using Mozu.SiteBuilder.UX.Models;
    using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    /// 
    //[DataContract(Name = "widgetInstance")]
    //public class WidgetInstance : CmsDocumentBase
    //{
    //    public WidgetInstance(ICmsTypeHelper typeHelper, IEditableContext context)
    //        : base(typeHelper, context)
    //    {
            
    //    }
    //    public dynamic config
    //    {
    //        get { return this["widget_configuration"]; }
    //    }

    //  //  string _DefinitionId;
    //    [DataMember(Name = "definitionId")]
    //    public string DefinitionId { get; set; }

    //   // string _ZoneId; 
    //    [DataMember(Name = "zoneId")]
    //    public string ZoneId { get; set; }
    //    [DataMember(Name = "sequence")]
    //    public double   Sequence { get; set; }
    //    public WidgetDefinition WigetDefinition { get; set; }
    //    //public DocumentType DocType { get; set; }

    //    public void Init ()
    //    {
    //        if (this.Properties == null || this.Properties.Count == 0)
    //        {
    //            return;
    //        }
    //        DefinitionId =  (string)this[ CmsConstants.Widgets.widget_type_id ];
    //        //WigetDefinition = WidgetDefinition.Mocks.FirstOrDefault(_wd => string.Equals((string)_doc.GetValue(CmsConstants.Widgets.widget_type_id), _wd.Id, StringComparison.OrdinalIgnoreCase)),
    //        ZoneId = (string)this[ CmsConstants.Widgets.widget_zone  ];
    //        Sequence = Convert.ToDouble ( this[ CmsConstants.Widgets.widget_sequence ] ?? 99);
    //        this.WigetDefinition = TypeHelper.GetWidgetDefintion(this.DefinitionId);
    //    }
      
        
    //    public override  System.Web.Mvc.ModelMetadata GetModelMetadata(string propertyName)
    //    {
    //         System.Web.Mvc.ModelMetadata mmd;
    //         if (this.ModelMetadataCache.TryGetValue(propertyName, out mmd))
    //         {
    //             return mmd;
    //         }
    //         mmd = base.GetModelMetadata(propertyName);


    //        //mmd = new ModelMetadata(ModelMetadataProviders.Current, this.GetType(), () => prop.GetValue(this, null), prop.PropertyType, propertyName);
    //        mmd.AdditionalValues["definitionId"] = this.DefinitionId;

    //        var seq = this.Properties.GetValue("widget_sequence") as int?; 

    //        mmd.AdditionalValues["sequence"] = seq.HasValue ?  seq.Value : 0 ;

           
            
    //        if ( this.WigetDefinition != null )
    //        {
    //            //tbd look up edit type;
                
    //        }
                
           
            
    //        return mmd;
    //    }

    //    public override ModelMetadata GetModelMetadata()
    //    {
    //        System.Web.Mvc.ModelMetadata mmd;
    //        if (this.ModelMetadataCache.TryGetValue("___", out mmd))
    //        {
    //            return mmd;
    //        }
    //        mmd = base.GetModelMetadata("___");


    //        var wid = this.TypeHelper.GetWidgetDefintion(this.DefinitionId.ToString());
           
    //        mmd.AdditionalValues["data-attribute-name"] = "data-editing-widget";
    //        mmd.AdditionalValues["zoneId"]=this.ZoneId;
    //        mmd.AdditionalValues["sequence"] = (double ?)this.Properties[CmsConstants.Widgets.widget_sequence] ?? 0;
    //        mmd.AdditionalValues["editView"] = wid.EditView;
    //        mmd.AdditionalValues["definitionId"] = this.DefinitionId;


            
    //        return mmd;
    //    }
    //}

   
}
