// -----------------------------------------------------------------------
// <copyright file="WidgetPreviewContext.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Web.Mvc;
using Autofac;
using Autofac.Integration.Mvc;
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
    using Mozu.SiteBuilder.Mvc.Cms;

    
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
    public class WidgetPreviewData:WidgetRuntimeData
    {
        [DataMember(Name = "context")]
        public CmsPageContext Context { get; set; }
        [DataMember(Name = "output")]
        public string Output { get; set; }
    }
    [DataContract()]
    public class WidgetRuntimeData : WidgetInstanceData, IModelMetadataParentContainer, IModelMetadataContainer, Mozu.SiteBuilder.UX.Models.IAlternateNamingValueContainer, ICmsMetaDataExtrator
    {

        public WidgetDefinition Definition { get; set; }

        public System.Web.Mvc.ModelMetadata GetModelMetadata()
        {
            
            var mmd  = GetModelMetadata("___");
            //return mmd;
           // var wid = this.TypeHelper.GetWidgetDefintion(this.DefinitionId.ToString());
            var jobj = Newtonsoft.Json.Linq.JObject.FromObject(this);
          //  jobj["editView"] = wid.EditView;

            mmd.AdditionalValues["data-attribute-name"] = "data-editing-widget";
            mmd.AdditionalValues["data-editing"] = jobj;
            

            return mmd;
        }

        ICmsTypeHelper TypeHelper
        {
            get
            {
                return AutofacDependencyResolver.Current.RequestLifetimeScope.Resolve<ICmsTypeHelper>();
            }
        }
        public System.Web.Mvc.ModelMetadata GetModelMetadata(string property)
        {
            var mmd = new ModelMetadata(ModelMetadataProviders.Current, this.GetType(), () => "na", typeof(string), property);
            return mmd;
        }

        public bool IsPreview { get; set; }

        private static string[] g_propNames;
        public virtual Object this[string key]
        {
            get
            {
                if (g_propNames == null)
                {
                    g_propNames = this.GetType().GetProperties().Select(x => x.Name).ToArray();
                }
                if (g_propNames.Contains(key, StringComparer.OrdinalIgnoreCase))
                {
                    return this.GetAlternateNamedValue(key);
                }
                return this.Config[key];
            }
        }

        public ModelMetadata GetCmsModelMetadata(string expression)
        {
            var parts = expression.Split('.');
            if (parts.Length < 2 && !string.Equals( parts[2] , "config", StringComparison.OrdinalIgnoreCase ))
            {
                return null;
            }
            var mmd = new ModelMetadata(ModelMetadataProviders.Current, this.GetType(), () => "na", typeof(string), expression);
            
            mmd.AdditionalValues["data-attribute-name"] = "data-editing-element";

            mmd.AdditionalValues["id"] = this.Id ;
            mmd.AdditionalValues["entityType"] = "widget";
            mmd.AdditionalValues["fieldName"] = expression.Split('.').Last();
            
            // mmd.AdditionalValues["data-editing"] = jobj;
            
            


            return mmd;

        }
    }
    [DataContract()]
    public class WidgetInstanceData 
    {
        public WidgetInstanceData()
        {
            Id = Guid.NewGuid().ToString();
        }
        [DataMember(Name = "definitionId")]
        public string DefinitionId { get; set; }

        //[DataMember(Name = "zoneId")]
        [JsonProperty(PropertyName = "zoneId")]
        public string ZoneId { get; set; }

        [DataMember(Name = "index")]
        public int? Index { get; set; }

        [DataMember(Name = "configuration")]
        public string ConfigurationData { get; set; }

        private Newtonsoft.Json.Linq.JObject _config;

        [DataMember(Name = "config")]
        public Newtonsoft.Json.Linq.JObject Config
        {
            get
            {
                if (_config == null && !string.IsNullOrEmpty(this.ConfigurationData))
                {
                    _config = Newtonsoft.Json.Linq.JObject.Parse(this.ConfigurationData);
                }
                if (_config == null)
                {
                    _config = new JObject();
                }
                return _config;
            }
            set
            {
                _config = value;
                if (value == null)
                {
                    this.ConfigurationData = null;
                    return;
                }
                this.ConfigurationData = _config.ToString(Formatting.None);

            }
        }

        [DataMember(Name = "zoneScope")]
        public string ZoneScope { get; set; }
       
        [DataMember(Name = "source")]
        public DocumentRequest Source { get; set; }

        [DataMember(Name = "id")]
        public string Id { get; set; }
    }
    
}
