// -----------------------------------------------------------------------
// <copyright file="WidgetPreviewContext.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------


//using Autofac;

using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.ModelMetaData;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.Mvc.Models.CMS.Admin
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Runtime.Serialization;
    using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;

    // using Mozu.SiteBuilder.Mvc.Cms;


    //[DataContract(Name = "widgetLocationContext")]
    //public class WidgetPreviewContext
    //{
    //    [DataMember(Name = "configuration")]
    //    public string ConfigurationData { get; set; }

    //    [DataMember(Name = "pageContext", EmitDefaultValue = false)]
    //    public PageContext PageContext { get; set; }

    //    [DataMember(Name = "definitionId")]
    //    public string DefinitionId { get; set; }

    //    [DataMember(Name = "zoneId")]
    //    public string  ZoneId { get; set; }

    //    [DataMember(Name = "zoneScope")]
    //    public string ZoneScope { get; set; }


    //    [DataMember(Name = "output")]
    //    public string Output { get; set; }


    //     [DataMember(Name = "index")]
    //    public int? Index { get; set; }



    //     public string DocumentId { get; set; }
    //}
    [DataContract()]
    public class WidgetPreviewData<T> : ZoneWidgetRuntimeData
    {
        [DataMember(Name = "context")]
        public CmsPageContext Context { get; set; }

        [DataMember(Name = "output")]
        public string Output { get; set; }

        public T Definition { get; set; }

        public bool IsPreview { get; set; }

        [DataMember(Name = "source")]
        public DocumentRequest Source { get; set; }

        [DataMember(Name = "zoneScope")]
        public string ZoneScope { get; set; }

        [DataMember(Name = "widgetType")]
        public string widgetType { get; set; }
    }

    public enum ZoneScope
    {
        Page,
        Template,
        Site
    };
    public class Chorizo
    {
        public class ZoneRuntimeData
        {
            public string Id { get; set; }
            public List<ZoneRowRuntimeData> Rows { get; set; }
            public DocumentRequest Source { get; set; }
            [Newtonsoft.Json.JsonIgnore]
            [System.Text.Json.Serialization.JsonIgnore]
            public ZoneScope Scope { get; set; }
            public string Build { get; set; }
        }


        public class ZoneRowRuntimeData
        {

            public List<ZoneColumnsRuntimeData> Columns { get; set; }

        }

        public class ZoneColumnsRuntimeData
        {
            public int? Span { get; set; }
            public string Width { get; set; }
            public List<ZoneWidgetRuntimeData> Widgets { get; set; }
        }
    }

    public class Caliente

    {
        public class ZoneRuntimeData
        {
            public string Id { get; set; }
            public JToken Json { get; set; }

            List<ZoneRowRuntimeData> _rows;
            public List<ZoneRowRuntimeData> Rows
            {
                get
                {
                    if (_rows == null)
                    {
                        try
                        {
                            _rows = Json.ToObject<List<ZoneRowRuntimeData>>() ?? new List<ZoneRowRuntimeData>();
                        }
                        catch( Exception )
                        {
                            _rows = new List<ZoneRowRuntimeData>();
                        }
                    }
                    return _rows;
                }
                set
                {
                    _rows = value;
                }
            }
            public DocumentRequest Source { get; set; }
            [Newtonsoft.Json.JsonIgnore]
            [System.Text.Json.Serialization.JsonIgnore]
            public ZoneScope Scope { get; set; }
            public string Build { get; set; }
        }

        public class ZoneRowRuntimeData
        {
            public List<ZoneColumnsRuntimeData> Columns { get; set; }
            public string Title { get; set; }
        }

        public class ZoneColumnsRuntimeData
        {
            public string Width { get; set; }
            public string Span { get; set; }
            public List<ZoneWidgetRuntimeData> Widgets { get; set; }
            public List<ZoneRowRuntimeData> Rows { get; set; }
        }
    }

    [DataContract]
    public class ZoneWidgetRuntimeData
    {

        public ZoneWidgetRuntimeData()
        {
            Id = Guid.NewGuid().ToString();
        }
          [DataMember(Name = "definitionId")]
        public string DefinitionId { get; set; }

          [DataMember(Name = "isRichText")]
        public bool isRichText { get; set; }
          [DataMember(Name = "config")]
        public JToken Config { get; set; }
          [DataMember(Name = "id")]
        public string Id { get; set; }
    }


    //[DataContract()]
    //public class WidgetRuntimeData : WidgetInstanceData, IModelMetadataParentContainer, IModelMetadataContainer, ICmsMetaDataExtrator
    //{

    //    public WidgetDefinition Definition { get; set; }

    //    public Dictionary<string,object > GetModelMetadata()
    //    {
           
    //        var mmd  = GetModelMetadata("___");
    //        //return mmd;
    //       // var wid = this.TypeHelper.GetWidgetDefintion(this.DefinitionId.ToString());
    //        var jobj = Newtonsoft.Json.Linq.JObject.FromObject(this);
    //      //  jobj["editView"] = wid.EditView;

    //        mmd["data-attribute-name"] = "data-editing-widget";
    //        mmd["data-editing"] = jobj;
            

    //        return mmd;
    //    }

    //    ICmsTypeHelper TypeHelper
    //    {
    //        get
    //        {
    //            throw new NotImplementedException("return AutofacDependencyResolver.Current.RequestLifetimeScope.Resolve<ICmsTypeHelper>();");
                
    //        }
    //    }
    //    public Dictionary<string,object > GetModelMetadata(string property)
    //    {
    //        var mmd = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
    //        return mmd;
    //    }

    //    public bool IsPreview { get; set; }

        
    //    public virtual Object this[string key]
    //    {
    //        get
    //        {
    //            return this.Config[key];
    //        }
    //    }

    //    public Dictionary<string,object > GetCmsModelMetadata(string expression)
    //    {
    //        var parts = expression.Split('.');
    //        if (parts.Length < 2 && !string.Equals( parts[2] , "config", StringComparison.OrdinalIgnoreCase ))
    //        {
    //            return null;
    //        }
    //        var mmd = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
            
    //        mmd["data-attribute-name"] = "data-editing-element";

    //        mmd["id"] = this.Id ;
    //        mmd["entityType"] = "widget";
    //        mmd["fieldName"] = expression.Split('.').Last();
            
    //        // mmd["data-editing"] = jobj;
            
            


    //        return mmd;

    //    }
    //}
    //[DataContract()]
    //public class WidgetInstanceData 
    //{
    //    public WidgetInstanceData()
    //    {
    //        Id = Guid.NewGuid().ToString();
    //    }
    //    [DataMember(Name = "definitionId")]
    //    public string DefinitionId { get; set; }

    //    //[DataMember(Name = "zoneId")]
    //    [JsonProperty(PropertyName = "zoneId")]
    //    public string ZoneId { get; set; }

    //    [DataMember(Name = "index")]
    //    public int? Index { get; set; }

    //    [DataMember(Name = "configuration")]
    //    public string ConfigurationData { get; set; }

    //    private Newtonsoft.Json.Linq.JObject _config;

    //    [DataMember(Name = "config")]
    //    public Newtonsoft.Json.Linq.JObject Config
    //    {
    //        get
    //        {
    //            if (_config == null && !string.IsNullOrEmpty(this.ConfigurationData))
    //            {
    //                _config = Newtonsoft.Json.Linq.JObject.Parse(this.ConfigurationData);
    //            }
    //            if (_config == null)
    //            {
    //                _config = new JObject();
    //            }
    //            return _config;
    //        }
    //        set
    //        {
    //            _config = value;
    //            if (value == null)
    //            {
    //                this.ConfigurationData = null;
    //                return;
    //            }
    //            this.ConfigurationData = _config.ToString(Formatting.None);

    //        }
    //    }

    //    [DataMember(Name = "zoneScope")]
    //    public string ZoneScope { get; set; }
       
    //    [DataMember(Name = "source")]
    //    public DocumentRequest Source { get; set; }

    //    [DataMember(Name = "id")]
    //    public string Id { get; set; }
    //}
    
}
